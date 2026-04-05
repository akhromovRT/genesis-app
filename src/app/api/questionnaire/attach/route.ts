import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const BodySchema = z.object({
  sessionToken: z.string().min(16).max(64),
});

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { sessionToken } = BodySchema.parse(body);

    await db
      .update(questionnaireSessions)
      .set({ userId: user.id })
      .where(
        and(
          eq(questionnaireSessions.sessionToken, sessionToken),
          isNull(questionnaireSessions.userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
