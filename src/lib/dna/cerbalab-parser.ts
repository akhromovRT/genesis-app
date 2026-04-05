import pdfParse from "pdf-parse-fork";
import type { ParsedReport, ParsedMarker, ParsedHeader } from "./types";
import { DnaParseError } from "./types";

const GENOTYPE_RE = /^([A-Z]\/[A-Z]|wt\/\w+|NA|\d+[A-Z]*\/\d+[A-Z]*|\d+-\d+\/\d+)$/;
const RS_RE = /^(rs\d+|del|ep)$/;

function extractHeader(text: string): ParsedHeader {
  const extractField = (label: string): string | null => {
    const re = new RegExp(label + "\\s+(.+?)(?:\\s*\\n|$)");
    const m = text.match(re);
    return m ? m[1].trim() : null;
  };

  return {
    lastName: extractField("Фамилия"),
    firstName: extractField("Имя"),
    middleName: extractField("Отчество"),
    birthDate: extractField("Дата рождения"),
    sex: extractField("Пол"),
    sampleType: extractField("Вид"),
    sampleNumber: extractField("Образец No"),
    sampleDate: extractField("Дата поступления образца"),
    resultDate: extractField("Дата выдачи результата"),
  };
}

function extractMarkers(text: string): ParsedMarker[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const markers: ParsedMarker[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: position alone, OR position followed by content
    const posMatch = line.match(/^(\d{1,3})(?:\s+(.+))?$/);
    if (!posMatch) continue;
    const position = parseInt(posMatch[1], 10);
    if (position < 1 || position > 250) continue;

    // Expected: strictly increasing sequence starting from 1
    if (markers.length > 0 && position !== markers[markers.length - 1].position + 1) {
      continue;
    }
    if (markers.length === 0 && position !== 1) continue;

    // Collect chunks until genotype or next position
    const chunks: string[] = [];
    if (posMatch[2]) chunks.push(posMatch[2].trim());

    if (chunks.length > 0 && GENOTYPE_RE.test(chunks[0])) continue;

    let j = i + 1;
    while (j < lines.length && j < i + 6 && chunks.length < 4) {
      const l = lines[j];
      if (/^\d{1,3}(?:\s|$)/.test(l)) {
        const nextPosMatch = l.match(/^(\d{1,3})/);
        if (nextPosMatch && parseInt(nextPosMatch[1], 10) === position + 1) break;
      }
      chunks.push(l);
      if (GENOTYPE_RE.test(l)) break;
      j++;
    }

    if (chunks.length === 0) continue;
    const lastChunk = chunks[chunks.length - 1];
    if (!GENOTYPE_RE.test(lastChunk)) continue;

    const genotype = lastChunk;
    const rest = chunks.slice(0, -1).join(" ").replace(/\s+/g, " ").trim();
    const tokens = rest.split(" ");

    if (tokens.length === 0 || !tokens[0]) continue;

    let gene: string;
    let rsid: string;
    const lastToken = tokens[tokens.length - 1];
    if (RS_RE.test(lastToken)) {
      rsid = lastToken;
      gene = tokens.slice(0, -1).join(" ");
    } else {
      gene = rest;
      rsid = "";
    }

    if (!gene) continue;
    markers.push({ position, gene, rsid, genotype });
  }

  return markers;
}

export async function parseCerbalabReport(pdfBuffer: Buffer): Promise<ParsedReport> {
  let text: string;
  try {
    const result = await pdfParse(pdfBuffer);
    text = result.text;
  } catch (error) {
    throw new DnaParseError("Не удалось прочитать PDF файл");
  }

  const header = extractHeader(text);
  const markers = extractMarkers(text);

  // Validation
  if (!header.lastName && !header.firstName) {
    throw new DnaParseError("Не удалось распознать формат CERBALAB: отсутствует информация о пациенте");
  }
  if (markers.length < 100) {
    throw new DnaParseError(`Неправильный формат отчёта: найдено только ${markers.length} маркеров (ожидалось 200+)`);
  }
  if (markers.length > 250) {
    throw new DnaParseError("Неправильный формат отчёта: слишком много маркеров");
  }

  return { header, markers, fullText: text };
}

export function buildPatientName(header: ParsedHeader): string {
  const parts = [header.lastName, header.firstName, header.middleName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Неизвестно";
}
