import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const adminDb = createAdminClient();

  const { data, error } = await adminDb
    .from("tests")
    .insert(body)
    .select()
    .single();

  if (error) {
    console.error("Create test error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const body = await request.json();
  const adminDb = createAdminClient();

  const { data, error } = await adminDb
    .from("tests")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update test error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
