import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SummaryView } from "@/components/questionnaire/summary/summary-view";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import type { Highlight } from "@/lib/questionnaire/rules";

export const dynamic = "force-dynamic";

export default async function DashboardQuestionnairePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [session] = await db
    .select()
    .from(questionnaireSessions)
    .where(
      and(
        eq(questionnaireSessions.userId, user.id),
        eq(questionnaireSessions.status, "completed")
      )
    )
    .orderBy(desc(questionnaireSessions.completedAt))
    .limit(1);

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold">Анкета ещё не пройдена</h2>
            <p className="mt-2 text-muted-foreground">
              Пройдите биохакинг-анкету, чтобы получить персональные подсветки.
            </p>
            <Link href="/questionnaire/start" className="mt-4 inline-block">
              <Button size="lg">Пройти анкету</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parsed = CompletedAnswersSchema.safeParse(session.answers);
  if (!parsed.success) {
    return <div className="mx-auto max-w-3xl px-4 py-12">Ошибка чтения анкеты</div>;
  }
  const highlights = (session.highlights as Highlight[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Моя анкета</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Пройдена: {session.completedAt?.toLocaleDateString("ru-RU")}
        </p>
      </div>
      <SummaryView answers={parsed.data} highlights={highlights} />
    </div>
  );
}
