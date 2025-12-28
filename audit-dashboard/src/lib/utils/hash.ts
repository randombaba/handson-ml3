import { createHash } from "crypto";

export const buildReportId = (input: string): string =>
  createHash("sha256").update(input).digest("hex");
