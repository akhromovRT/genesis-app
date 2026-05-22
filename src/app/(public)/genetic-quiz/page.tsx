import type { Metadata } from "next";
import { GeneticQuizFlow } from "@/components/genetic-quiz/quiz-flow";
import { MIN_SELECTION } from "@/lib/genetic-quiz/questions";

export const metadata: Metadata = {
  title: "Генетический чекап питания — узнай свою ДНК-карту | Genesis",
  description:
    "Ответь на вопросы о своём теле и питании — узнай, какие генетические точки отвечают за стройность, энергию и кожу. Бесплатно, без регистрации.",
  openGraph: {
    title: "Генетический чекап питания | Genesis",
    description:
      "Пройди опросник — получи карту генетических маркеров твоего метаболизма.",
  },
};

export default function GeneticQuizPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Генетический чекап питания
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Отметь хотя бы {MIN_SELECTION} вопроса, которые тебе откликаются — и
          узнай, какие генетические точки твоей ДНК-карты отвечают за стройность,
          энергию, отёки и состояние кожи. Бесплатно, без регистрации.
        </p>
      </div>

      <div className="mt-10">
        <GeneticQuizFlow />
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Не является медицинской услугой. Программа оздоровления относится к сфере
        ЗОЖ/натуропрактики.
      </p>
    </div>
  );
}
