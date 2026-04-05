import { NextResponse } from "next/server";
import { db } from "@/db";
import { dnaReports, dnaMarkers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { parseCerbalabReport, buildPatientName } from "@/lib/dna/cerbalab-parser";
import { DnaParseError } from "@/lib/dna/types";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Допустим только PDF формат" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Файл слишком большой (макс. 20 МБ)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Parse PDF
  let parsed;
  try {
    parsed = await parseCerbalabReport(buffer);
  } catch (error) {
    if (error instanceof DnaParseError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("DNA parse error:", error);
    return NextResponse.json({ error: "Ошибка обработки PDF" }, { status: 500 });
  }

  // Save file to disk
  const uploadDir = path.join(process.cwd(), "data", "dna", user.id);
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Zа-яА-Я0-9.-]/g, "_")}`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const relativeFilePath = `dna/${user.id}/${fileName}`;
  const patientName = buildPatientName(parsed.header);

  // Save to DB
  const [report] = await db.insert(dnaReports).values({
    userId: user.id,
    lab: "cerbalab",
    patientName,
    birthDate: parsed.header.birthDate,
    sex: parsed.header.sex,
    sampleType: parsed.header.sampleType,
    sampleNumber: parsed.header.sampleNumber,
    sampleDate: parsed.header.sampleDate,
    resultDate: parsed.header.resultDate,
    filePath: relativeFilePath,
    fileName: file.name,
    fileSize: file.size,
    fullText: parsed.fullText,
    markersCount: parsed.markers.length,
  }).returning();

  await db.insert(dnaMarkers).values(
    parsed.markers.map((m) => ({
      reportId: report.id,
      position: m.position,
      gene: m.gene,
      rsid: m.rsid,
      genotype: m.genotype,
    }))
  );

  return NextResponse.json({
    success: true,
    reportId: report.id,
    markersCount: parsed.markers.length,
    patientName,
  });
}
