import { z } from "zod";

import { parseTargetDate, computeDueDate, isOverdue } from "./date";
import { classifyStatusStage } from "./status";
import { buildReportId } from "./hash";
import type { RawReportRow } from "../parsers/types";

export const reportSchema = z.object({
  universe: z.enum(["STATE", "UNION"]),
  functionalWing: z.string(),
  domainOrSector: z.string().nullable(),
  region: z.string().nullable(),
  jurisdictionType: z.enum(["STATE", "UT", "UNION_GOVT"]),
  jurisdictionName: z.string(),
  officeName: z.string().nullable(),
  reportTitle: z.string(),
  reportType: z.enum([
    "Compliance",
    "Performance",
    "LGA",
    "Commercial",
    "Financial",
    "Other"
  ]),
  aapYear: z.string(),
  targetDate: z.date().nullable(),
  revisedTargetDate: z.date().nullable(),
  targetTextRaw: z.string().nullable(),
  currentStatusText: z.string(),
  currentStatusStage: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "SUBMITTED",
    "APPROVED",
    "PROPOSED",
    "ON_HOLD",
    "UNKNOWN"
  ]),
  currentStatusDate: z.date().nullable(),
  dueDateComputed: z.date().nullable(),
  isOverdue: z.boolean(),
  lastSeenInBatchId: z.string(),
  firstSeenBatchId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

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
