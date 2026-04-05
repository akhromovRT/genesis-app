import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, FileCheck, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Биохакинг-анкета — персональный анамнез | Genesis",
  description: "Бесплатная биохакинг-анкета: образ жизни, питание, здоровье. 9 шагов, ~25 минут, 15 автоматических подсветок рисков. Без регистрации.",
  openGraph: {
    title: "Биохакинг-анкета | Genesis",
    description: "Структурированный анамнез за 25 минут с подсветкой рисков.",
  },
};

export default function QuestionnairePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Биохакинг-анкета
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Расскажите о себе — и получите структурированную карту рисков по образу
          жизни, питанию и здоровью за 25 минут. Бесплатно, без регистрации.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 text-center">
          <Clock className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-semibold">9 шагов, ~25 минут</p>
          <p className="mt-1 text-sm text-muted-foreground">С автосохранением</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-semibold">15 подсветок</p>
          <p className="mt-1 text-sm text-muted-foreground">Автоматический анализ ответов</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <FileCheck className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-semibold">100+ вопросов</p>
          <p className="mt-1 text-sm text-muted-foreground">Полный биохакинг-анамнез</p>
        </CardContent></Card>
      </div>

      <div className="mt-10 text-center">
        <Link href="/questionnaire/start">
          <Button size="lg">Начать анкету</Button>
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Не является медицинской услугой. Программа оздоровления относится к сфере ЗОЖ/натуропрактики.
      </p>
    </div>
  );
}
