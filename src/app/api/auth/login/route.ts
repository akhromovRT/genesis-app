import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const [user] = await db.select().from(profiles).where(eq(profiles.email, data.email)).limit(1);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const token = await signToken({ id: user.id, email: user.email, role: user.role! });
    await setAuthCookie(token);

    return NextResponse.json({ user: { id: user.id, email: user.email, fullName: user.fullName } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Проверьте введённые данные" }, { status: 400 });
    }
    console.error("Login error:", error);
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
