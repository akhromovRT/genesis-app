import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = (await params).path;
  const orderId = segments[0];

  if (user.role !== "admin") {
    const [order] = await db.select({ userId: orders.userId })
      .from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const filePath = path.join(process.cwd(), "data", "uploads", ...segments);
  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
