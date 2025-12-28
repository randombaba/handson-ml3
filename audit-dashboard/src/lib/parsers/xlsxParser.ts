import * as XLSX from "xlsx";

import type { ParseResult, RawReportRow } from "./types";

export type ColumnMapping = {
  reportTitle: string[];
  aapYear: string[];
  targetDate: string[];
  revisedTargetDate: string[];
  status: string[];
  functionalWing?: string[];
  jurisdictionName?: string[];
  officeName?: string[];
};

const defaultMapping: ColumnMapping = {
  reportTitle: ["audit report", "report title", "name/title of audit report"],
  aapYear: ["aap", "aap year"],
  targetDate: ["target date", "target date of submission"],
  revisedTargetDate: ["revised target date", "revised target"],
  status: ["status", "remarks"],
  functionalWing: ["wing", "functional wing"],
  jurisdictionName: ["state", "jurisdiction"],
  officeName: ["office", "o/o"]
};

export const parseXlsxBuffer = (buffer: ArrayBuffer, mapping = defaultMapping): ParseResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  const rows: RawReportRow[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
      json.forEach((record, index) => {
        const normalized = normalizeRecord(record);
        const getValue = (keys: string[]) =>
          keys
            .map((key) => normalized[key])
            .find((value) => value !== undefined && value !== "");

        const reportTitle = getValue(mapping.reportTitle);
        const aapYear = getValue(mapping.aapYear);
        if (!reportTitle || !aapYear) {
          warnings.push(`Sheet ${sheetName} row ${index + 2}: missing report title or AAP`);
          return;
        }

        rows.push({
          universe: "STATE",
          functionalWing: getValue(mapping.functionalWing) ?? null,
          jurisdictionName: getValue(mapping.jurisdictionName) ?? null,
          officeName: getValue(mapping.officeName) ?? null,
          reportTitle,
          aapYear,
          targetDateText: getValue(mapping.targetDate) ?? null,
          revisedTargetDateText: getValue(mapping.revisedTargetDate) ?? null,
          statusText: getValue(mapping.status) ?? ""
        });
      });
    });
  } catch (error) {
    errors.push(`XLSX parse failed: ${(error as Error).message}`);
  }

  return { rows, warnings, errors };
};

const normalizeRecord = (record: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key.toLowerCase().trim(), String(value).trim()])
  );
