import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "ready",
    "completed",
    "cancelled",
    "refunded",
  ]),
  comment: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const data = statusSchema.parse(body);

  const adminDb = createAdminClient();

  // Update order status
  const { error: updateError } = await adminDb
    .from("orders")
    .update({ status: data.status })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Ошибка обновления статуса" },
      { status: 500 }
    );
  }

  // Log status change
  await adminDb.from("order_status_history").insert({
    order_id: id,
    status: data.status,
    changed_by: user.id,
    comment: data.comment || "",
  });

  return NextResponse.json({ success: true });
}
