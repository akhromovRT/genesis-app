import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderStatusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "ready", "completed", "cancelled", "refunded"]),
  comment: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const data = statusSchema.parse(body);

  await db.update(orders).set({ status: data.status }).where(eq(orders.id, id));
  await db.insert(orderStatusHistory).values({
    orderId: id,
    status: data.status,
    changedBy: admin.id,
    comment: data.comment || "",
  });

  return NextResponse.json({ success: true });
}
