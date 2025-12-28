import mammoth from "mammoth";

import type { ParseResult, RawReportRow } from "./types";

const regionRegex = /(Central|Eastern|Western|Northern|Southern|North Eastern) Region/i;
const officeRegex = /O\/o the PAG\/AG.*?,\s*(.*)$/i;

export const parseDocxBuffer = async (buffer: ArrayBuffer): Promise<ParseResult> => {
  const warnings: string[] = [];
  const errors: string[] = [];

  let rawText = "";
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    rawText = result.value;
    result.messages.forEach((msg) => warnings.push(msg.message));
  } catch (error) {
    errors.push(`Mammoth failed: ${(error as Error).message}`);
  }

  if (!rawText) {
    const fallback = await tryDocx4js(buffer);
    rawText = fallback.rawText;
    warnings.push(...fallback.warnings);
    errors.push(...fallback.errors);
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: RawReportRow[] = [];
  let currentRegion: string | null = null;
  let currentOffice: string | null = null;
  let currentWing: string | null = null;
  let currentDomain: string | null = null;

  for (const line of lines) {
    if (regionRegex.test(line)) {
      currentRegion = line;
      currentOffice = null;
      continue;
    }

    if (officeRegex.test(line)) {
      currentOffice = line;
      currentWing = "State Audit";
      currentDomain = null;
      continue;
    }

    if (/Wing/i.test(line) || /Audit Wing/i.test(line)) {
      currentWing = line;
      currentDomain = null;
      continue;
    }

    if (/Customs|Direct Taxes|GST|Excise|Revenue/i.test(line)) {
      currentDomain = line;
      continue;
    }

    const columns = line.split(/\s{2,}|\t+/).map((entry) => entry.trim());
    if (columns.length >= 4) {
      const [_, reportTitle, aapYear, targetDateText, statusText] = normalizeColumns(columns);
      if (!reportTitle || !aapYear) {
        warnings.push(`Skipped line due to missing report title or AAP: ${line}`);
        continue;
      }
      rows.push({
        universe: currentOffice ? "STATE" : "UNION",
        region: currentRegion,
        functionalWing: currentWing,
        domainOrSector: currentDomain,
        jurisdictionName: currentOffice ? extractStateName(currentOffice) : null,
        officeName: currentOffice,
        reportTitle,
        aapYear,
        targetDateText,
        statusText: statusText ?? ""
      });
    }
  }

  return { rows, warnings, errors };
};

const normalizeColumns = (columns: string[]): string[] => {
  if (columns.length === 4) {
    return ["", ...columns];
  }
  return columns;
};

const extractStateName = (office: string): string | null => {
  const match = officeRegex.exec(office);
  return match ? match[1].trim() : null;
};

const tryDocx4js = async (
  buffer: ArrayBuffer
): Promise<{ rawText: string; warnings: string[]; errors: string[] }> => {
  try {
    const docx4js = await import("docx4js");
    const doc = await docx4js.load(buffer);
    const paragraphs = doc.getObjectPart("word/document.xml").paragraphs;
    const rawText = paragraphs.map((p: { text: string }) => p.text).join("\n");
    return { rawText, warnings: ["docx4js fallback used"], errors: [] };
  } catch (error) {
    return {
      rawText: "",
      warnings: [],
      errors: [`docx4js fallback failed: ${(error as Error).message}`]
    };
  }
};
