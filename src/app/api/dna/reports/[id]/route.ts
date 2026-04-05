import { NextResponse } from "next/server";
import { db } from "@/db";
import { dnaReports, dnaMarkers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

async function getReportWithAuth(id: string) {
  const user = await requireUser();
  const [report] = await db.select().from(dnaReports).where(eq(dnaReports.id, id)).limit(1);
  if (!report) return { error: "Отчёт не найден", status: 404 as const };
  if (report.userId !== user.id && user.role !== "admin") {
    return { error: "Доступ запрещён", status: 403 as const };
  }
  return { report, user };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let auth;
  try {
    auth = await getReportWithAuth(id);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const markers = await db.select().from(dnaMarkers)
    .where(eq(dnaMarkers.reportId, id))
    .orderBy(asc(dnaMarkers.position));

  return NextResponse.json({ report: auth.report, markers });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let auth;
  try {
    auth = await getReportWithAuth(id);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Delete file from disk
  const fullPath = path.join(process.cwd(), "data", auth.report.filePath);
  try {
    await unlink(fullPath);
  } catch (err) {
    console.error("Failed to delete file:", err);
    // Continue — DB cleanup is more important
  }

  // Delete from DB (cascade removes markers)
  await db.delete(dnaReports).where(eq(dnaReports.id, id));

  return NextResponse.json({ success: true });
}
