import { parse, parseISO, isValid } from "date-fns";

const monthYearFormats = ["MMM-yy", "MMM yyyy", "MMMM yyyy", "MM/yyyy", "MM.yyyy"];
const dateFormats = ["dd.MM.yyyy", "dd/MM/yyyy", "dd-MM-yyyy", "d MMMM yyyy", "d MMM yyyy"];

export const parseTargetDate = (raw: string): { date: Date | null; rawText: string | null } => {
  const trimmed = raw.trim();
  if (!trimmed) return { date: null, rawText: null };
  if (/session/i.test(trimmed) || /to be decided/i.test(trimmed)) {
    return { date: null, rawText: trimmed };
  }
  const direct = parseISO(trimmed);
  if (isValid(direct)) return { date: direct, rawText: trimmed };
  for (const fmt of dateFormats) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) return { date: parsed, rawText: trimmed };
  }
  for (const fmt of monthYearFormats) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) return { date: parsed, rawText: trimmed };
  }
  return { date: null, rawText: trimmed };
};

export const computeDueDate = (target: Date | null, revised: Date | null): Date | null =>
  revised ?? target ?? null;

export const isOverdue = (dueDate: Date | null, statusStage: string, now = new Date()): boolean => {
  if (!dueDate) return false;
  if (["APPROVED", "SUBMITTED"].includes(statusStage)) return false;
  return dueDate.getTime() < now.getTime();
};
