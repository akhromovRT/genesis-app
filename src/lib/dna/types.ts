export interface ParsedMarker {
  position: number;
  gene: string;
  rsid: string;
  genotype: string;
}

export interface ParsedHeader {
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  birthDate: string | null;
  sex: string | null;
  sampleType: string | null;
  sampleNumber: string | null;
  sampleDate: string | null;
  resultDate: string | null;
}

export interface ParsedReport {
  header: ParsedHeader;
  markers: ParsedMarker[];
  fullText: string;
}

export class DnaParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DnaParseError";
  }
}
