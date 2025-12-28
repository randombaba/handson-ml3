import { z } from "zod";

export const statusStageSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "APPROVED",
  "PROPOSED",
  "ON_HOLD",
  "UNKNOWN"
]);

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
  currentStatusStage: statusStageSchema,
  currentStatusDate: z.date().nullable(),
  dueDateComputed: z.date().nullable(),
  isOverdue: z.boolean(),
  lastSeenInBatchId: z.string(),
  firstSeenBatchId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ReportRecord = z.infer<typeof reportSchema>;

export const uploadBatchSchema = z.object({
  asOnDate: z.date(),
  datasetType: z.enum(["STATE", "UNION", "MIXED"]),
  fileName: z.string(),
  storagePath: z.string(),
  uploadedBy: z.string(),
  uploadedAt: z.date(),
  parseSummary: z.object({
    totalRows: z.number(),
    createdReports: z.number(),
    updatedReports: z.number(),
    warningsCount: z.number(),
    errorsCount: z.number()
  })
});

export type UploadBatchRecord = z.infer<typeof uploadBatchSchema>;
