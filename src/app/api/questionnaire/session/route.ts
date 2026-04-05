import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { FullAnswersSchema } from "@/lib/questionnaire/types";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const [session] = await db
    .select()
    .from(questionnaireSessions)
    .where(eq(questionnaireSessions.sessionToken, token))
    .limit(1);

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.userId) {
    const user = await getUser();
    if (!user || user.id !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({
    sessionToken: session.sessionToken,
    status: session.status,
    currentStep: session.currentStep,
    answers: session.answers,
    highlights: session.highlights,
    completedAt: session.completedAt,
  });
}

const PatchBodySchema = z.object({
  sessionToken: z.string().min(16).max(64),
  currentStep: z.number().int().min(0).max(9),
  answers: FullAnswersSchema,
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = PatchBodySchema.parse(body);
    const user = await getUser();

    const [existing] = await db
      .select()
      .from(questionnaireSessions)
      .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken))
      .limit(1);

    if (existing) {
      if (existing.userId && (!user || user.id !== existing.userId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await db
        .update(questionnaireSessions)
        .set({
          currentStep: parsed.currentStep,
          answers: parsed.answers,
        })
        .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken));
    } else {
      await db.insert(questionnaireSessions).values({
        sessionToken: parsed.sessionToken,
        userId: user?.id ?? null,
        status: "draft",
        currentStep: parsed.currentStep,
        answers: parsed.answers,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
