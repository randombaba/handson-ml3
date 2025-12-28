import { reportSchema } from "../schemas/report";
import { parseTargetDate, computeDueDate, isOverdue } from "../utils/date";
import { classifyStatusStage } from "../utils/status";
import { buildReportId } from "../utils/hash";

import type { RawReportRow } from "./types";

export const normalizeRow = (row: RawReportRow, batchId: string) => {
  const target = parseTargetDate(row.targetDateText ?? "");
  const revised = parseTargetDate(row.revisedTargetDateText ?? "");
  const status = classifyStatusStage(row.statusText);

  const dueDate = computeDueDate(target.date, revised.date);
  const reportId = buildReportId(
    [
      row.universe,
      row.functionalWing ?? "",
      row.jurisdictionName ?? "",
      row.officeName ?? "",
      row.reportTitle,
      row.aapYear
    ].join("|")
  );

  const record = {
    universe: row.universe,
    functionalWing: row.functionalWing ?? "Unknown",
    domainOrSector: row.domainOrSector ?? null,
    region: row.region ?? null,
    jurisdictionType: row.universe === "STATE" ? "STATE" : "UNION_GOVT",
    jurisdictionName: row.jurisdictionName ?? "Unknown",
    officeName: row.officeName ?? null,
    reportTitle: row.reportTitle,
    reportType: inferReportType(row.reportTitle),
    aapYear: row.aapYear,
    targetDate: target.date,
    revisedTargetDate: revised.date,
    targetTextRaw: revised.rawText ?? target.rawText,
    currentStatusText: row.statusText,
    currentStatusStage: status.stage,
    currentStatusDate: status.dateText ? new Date(status.dateText) : null,
    dueDateComputed: dueDate,
    isOverdue: isOverdue(dueDate, status.stage),
    lastSeenInBatchId: batchId,
    firstSeenBatchId: batchId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return { reportId, record: reportSchema.parse(record) };
};

const inferReportType = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("performance")) return "Performance";
  if (lower.includes("compliance")) return "Compliance";
  if (lower.includes("lga")) return "LGA";
  if (lower.includes("commercial")) return "Commercial";
  if (lower.includes("financial")) return "Financial";
  return "Other";
};
