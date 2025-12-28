import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onObjectFinalized } from "firebase-functions/v2/storage";

import { normalizeRow } from "./lib/normalize";
import { parseDocxBuffer } from "./parsers/docxParser";
import { parseXlsxBuffer } from "./parsers/xlsxParser";

initializeApp();

const db = getFirestore();
const storage = getStorage();

export const ingestAuditDataset = onObjectFinalized(
  { bucket: process.env.FIREBASE_STORAGE_BUCKET },
  async (event) => {
    const object = event.data;
    const filePath = object.name;
    if (!filePath) {
      console.warn("No file path provided");
      return;
    }

    const bucket = storage.bucket(object.bucket);
    const [fileBuffer] = await bucket.file(filePath).download();

    const extension = filePath.split(".").pop()?.toLowerCase();
    const batchRef = db.collection("uploadBatches").doc();

    let parseResult;
    if (extension === "docx") {
      parseResult = await parseDocxBuffer(fileBuffer.buffer);
    } else if (extension === "xlsx") {
      parseResult = parseXlsxBuffer(fileBuffer.buffer);
    } else {
      await batchRef.set({
        fileName: filePath,
        uploadedAt: FieldValue.serverTimestamp(),
        parseSummary: {
          totalRows: 0,
          createdReports: 0,
          updatedReports: 0,
          warningsCount: 0,
          errorsCount: 1
        },
        errors: ["Unsupported file type"]
      });
      return;
    }

    const { rows, warnings, errors } = parseResult;
    let createdReports = 0;
    let updatedReports = 0;

    const reportBatch = db.batch();
    for (const row of rows) {
      const { reportId, record } = normalizeRow(row, batchRef.id);
      const reportRef = db.collection("reports").doc(reportId);
      const existing = await reportRef.get();

      if (!existing.exists) {
        createdReports += 1;
        reportBatch.set(reportRef, record, { merge: true });
        reportBatch.set(reportRef.collection("statusEvents").doc(), {
          batchId: batchRef.id,
          statusText: record.currentStatusText,
          statusStage: record.currentStatusStage,
          statusDate: record.currentStatusDate,
          observedAt: FieldValue.serverTimestamp()
        });
      } else {
        updatedReports += 1;
        reportBatch.set(
          reportRef,
          {
            ...record,
            firstSeenBatchId: existing.data()?.firstSeenBatchId ?? batchRef.id
          },
          { merge: true }
        );
        reportBatch.set(reportRef.collection("statusEvents").doc(), {
          batchId: batchRef.id,
          statusText: record.currentStatusText,
          statusStage: record.currentStatusStage,
          statusDate: record.currentStatusDate,
          observedAt: FieldValue.serverTimestamp()
        });
      }
    }

    await reportBatch.commit();

    await batchRef.set({
      asOnDate: object.metadata?.asOnDate ? new Date(object.metadata.asOnDate) : null,
      datasetType: object.metadata?.datasetType ?? "MIXED",
      fileName: object.name,
      storagePath: filePath,
      uploadedBy: object.metadata?.uploadedBy ?? "system",
      uploadedAt: FieldValue.serverTimestamp(),
      parseSummary: {
        totalRows: rows.length,
        createdReports,
        updatedReports,
        warningsCount: warnings.length,
        errorsCount: errors.length
      },
      warnings,
      errors
    });
  }
);
