import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { profiles, questionnaireSessions } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  fullName: z.string().min(1, "Введите имя"),
  phone: z.string().optional(),
  sessionToken: z.string().min(16).max(64).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const [existing] = await db.select({ id: profiles.id })
      .from(profiles).where(eq(profiles.email, data.email)).limit(1);

    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);
    const [user] = await db.insert(profiles).values({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone || "",
      role: "user",
    }).returning();

    const token = await signToken({ id: user.id, email: user.email, role: user.role! });
    await setAuthCookie(token);

    // Attach anonymous questionnaire session if provided
    if (data.sessionToken) {
      try {
        await db
          .update(questionnaireSessions)
          .set({ userId: user.id })
          .where(
            and(
              eq(questionnaireSessions.sessionToken, data.sessionToken),
              isNull(questionnaireSessions.userId)
            )
          );
      } catch (err) {
        console.error("Failed to attach session:", err);
        // Don't fail registration if attach fails
      }
    }

    return NextResponse.json({ user: { id: user.id, email: user.email, fullName: user.fullName } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
  }
}
