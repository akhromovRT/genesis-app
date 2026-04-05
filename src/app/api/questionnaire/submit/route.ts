import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import { computeHighlights } from "@/lib/questionnaire/highlights";
import { z } from "zod";

const BodySchema = z.object({
  sessionToken: z.string().min(16).max(64),
  answers: CompletedAnswersSchema,
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BodySchema.parse(body);

    const user = await getUser();
    const highlights = computeHighlights(parsed.answers);

    const existing = await db
      .select()
      .from(questionnaireSessions)
      .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(questionnaireSessions)
        .set({
          status: "completed",
          currentStep: 9,
          answers: parsed.answers,
          highlights,
          email: parsed.email ?? existing[0].email,
          completedAt: new Date(),
          userId: user?.id ?? existing[0].userId,
        })
        .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken));
    } else {
      await db.insert(questionnaireSessions).values({
        sessionToken: parsed.sessionToken,
        userId: user?.id ?? null,
        status: "completed",
        currentStep: 9,
        answers: parsed.answers,
        highlights,
        email: parsed.email ?? null,
        completedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      sessionToken: parsed.sessionToken,
      highlights,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    console.error("submit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
