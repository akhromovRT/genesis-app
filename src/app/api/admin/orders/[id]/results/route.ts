import { NextResponse } from "next/server";
import { db } from "@/db";
import { testResults } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string;
  const description = (formData.get("description") as string) || "";

  if (!file || !userId) {
    return NextResponse.json({ error: "Файл и userId обязательны" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "data", "uploads", orderId);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const fileUrl = `/api/files/${orderId}/${fileName}`;

  await db.insert(testResults).values({
    orderId,
    userId,
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
    description,
    uploadedBy: admin.id,
  });

  return NextResponse.json({ success: true });
}
