import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string;
  const description = (formData.get("description") as string) || "";

  if (!file || !userId) {
    return NextResponse.json(
      { error: "Файл и userId обязательны" },
      { status: 400 }
    );
  }

  const adminDb = createAdminClient();

  // Upload to Supabase Storage
  const fileName = `${userId}/${orderId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await adminDb.storage
    .from("test-results")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json(
      { error: "Ошибка загрузки файла" },
      { status: 500 }
    );
  }

  // Get public/signed URL
  const {
    data: { publicUrl },
  } = adminDb.storage.from("test-results").getPublicUrl(fileName);

  // For private bucket, use signed URL instead
  const { data: signedData } = await adminDb.storage
    .from("test-results")
    .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

  const fileUrl = signedData?.signedUrl || publicUrl;

  // Create test_results record
  const { error: insertError } = await adminDb
    .from("test_results")
    .insert({
      order_id: orderId,
      user_id: userId,
      file_url: fileUrl,
      file_name: file.name,
      file_size: file.size,
      description,
      uploaded_by: user.id,
    });

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json(
      { error: "Ошибка сохранения записи" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
