export type RawReportRow = {
  universe: "STATE" | "UNION";
  region?: string | null;
  functionalWing?: string | null;
  domainOrSector?: string | null;
  jurisdictionName?: string | null;
  officeName?: string | null;
  reportTitle: string;
  aapYear: string;
  targetDateText?: string | null;
  revisedTargetDateText?: string | null;
  statusText: string;
};

export type ParseResult = {
  rows: RawReportRow[];
  warnings: string[];
  errors: string[];
};
