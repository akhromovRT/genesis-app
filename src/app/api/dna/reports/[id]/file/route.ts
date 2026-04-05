import { NextResponse } from "next/server";
import { db } from "@/db";
import { dnaReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [report] = await db.select().from(dnaReports).where(eq(dnaReports.id, id)).limit(1);
  if (!report) {
    return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
  }
  if (report.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const fullPath = path.join(process.cwd(), "data", report.filePath);
  try {
    const buffer = await readFile(fullPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(report.fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл не найден на сервере" }, { status: 404 });
  }
}
