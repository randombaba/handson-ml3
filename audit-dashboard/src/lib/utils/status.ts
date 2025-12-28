import { statusStageSchema } from "../schemas/report";

export const classifyStatusStage = (status: string): {
  stage: (typeof statusStageSchema)['_type'];
  dateText: string | null;
} => {
  const normalized = status.toLowerCase();
  if (/approved/.test(normalized)) {
    return { stage: "APPROVED", dateText: extractDateText(status) };
  }
  if (/submitted/.test(normalized)) {
    return { stage: "SUBMITTED", dateText: extractDateText(status) };
  }
  if (/under finalization|under process|consolidation|reply awaited/.test(normalized)) {
    return { stage: "IN_PROGRESS", dateText: extractDateText(status) };
  }
  if (/proposed/.test(normalized)) {
    return { stage: "PROPOSED", dateText: extractDateText(status) };
  }
  if (/to be decided|to be intimated|on hold/.test(normalized)) {
    return { stage: "ON_HOLD", dateText: null };
  }
  return { stage: "UNKNOWN", dateText: extractDateText(status) };
};

const extractDateText = (status: string): string | null => {
  const match = status.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/);
  return match ? match[0] : null;
};
