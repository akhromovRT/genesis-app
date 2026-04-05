declare module "pdf-parse-fork" {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }
  function pdfParse(buffer: Buffer | Uint8Array): Promise<PDFData>;
  export default pdfParse;
}
