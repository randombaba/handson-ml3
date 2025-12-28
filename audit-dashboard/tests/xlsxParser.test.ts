import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { parseXlsxBuffer } from "../src/lib/parsers/xlsxParser";

describe("parseXlsxBuffer", () => {
  it("parses a workbook into canonical rows", () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Audit Report": "Compliance Audit on Roads",
        AAP: "2023-24",
        "Target date": "31.07.2025",
        Status: "Submitted to CAG Sectt"
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = parseXlsxBuffer(buffer);

    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].reportTitle).toBe("Compliance Audit on Roads");
    expect(result.rows[0].aapYear).toBe("2023-24");
  });
});
