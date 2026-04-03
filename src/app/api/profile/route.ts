import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser, hashPassword } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      phone: profiles.phone,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.password) {
    const passwordHash = await hashPassword(body.password);
    await db
      .update(profiles)
      .set({ passwordHash })
      .where(eq(profiles.id, user.id));
    return NextResponse.json({ success: true });
  }

  await db
    .update(profiles)
    .set({
      fullName: body.fullName,
      phone: body.phone,
    })
    .where(eq(profiles.id, user.id));

  return NextResponse.json({ success: true });
}
