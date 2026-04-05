import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { SummaryView } from "@/components/questionnaire/summary/summary-view";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import type { Highlight } from "@/lib/questionnaire/rules";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ sessionToken: string }>;
}) {
  const { sessionToken } = await params;

  const [session] = await db
    .select()
    .from(questionnaireSessions)
    .where(eq(questionnaireSessions.sessionToken, sessionToken))
    .limit(1);

  if (!session || session.status !== "completed") notFound();

  if (session.userId) {
    const user = await getUser();
    if (!user || user.id !== session.userId) notFound();
  }

  const answersParsed = CompletedAnswersSchema.safeParse(session.answers);
  if (!answersParsed.success) notFound();

  const highlights = (session.highlights as Highlight[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Ваша сводка</h1>
        <p className="mt-2 text-muted-foreground">
          Результаты биохакинг-анкеты с автоматическими подсветками
        </p>
      </div>

      <SummaryView answers={answersParsed.data} highlights={highlights} />

      {!session.userId && (
        <div className="mt-10 rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
          <h3 className="text-lg font-semibold">Сохраните свою анкету</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Зарегистрируйтесь, чтобы сохранить ответы, подключить анализы крови и
            получить персональный протокол.
          </p>
          <Link href={`/register?sessionToken=${sessionToken}`} className="mt-4 inline-block">
            <Button size="lg">Создать аккаунт</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
