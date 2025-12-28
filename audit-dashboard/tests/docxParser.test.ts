import { describe, expect, it, vi } from "vitest";

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(async () => ({
      value: [
        "Central Region",
        "O/o the PAG (Audit), Maharashtra",
        "1  Performance Audit on Water Supply  2024-25  30.06.2025  Under finalization"
      ].join("\n"),
      messages: []
    }))
  }
}));

import { parseDocxBuffer } from "../src/lib/parsers/docxParser";

describe("parseDocxBuffer", () => {
  it("parses mocked docx text into rows", async () => {
    const buffer = new ArrayBuffer(8);
    const result = await parseDocxBuffer(buffer);

    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      universe: "STATE",
      reportTitle: "Performance Audit on Water Supply",
      aapYear: "2024-25"
    });
  });
});
