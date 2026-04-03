import type { Metadata } from "next";
import { CalculatorForm } from "@/components/calculator/calculator-form";

export const metadata: Metadata = {
  title: "Калькулятор биологического возраста PhenoAge",
  description:
    "Бесплатный калькулятор биологического возраста по формуле PhenoAge (Levine, 2018). Введите 9 маркеров крови и узнайте свой биовозраст.",
  openGraph: {
    title: "Калькулятор биологического возраста PhenoAge | Genesis",
    description: "Бесплатный калькулятор биологического возраста по 9 маркерам крови.",
  },
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Калькулятор биологического возраста
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Узнайте свой PhenoAge по 9 маркерам крови. Бесплатно, без регистрации.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          На основе исследования Levine et al., 2018
        </p>
      </div>

      <CalculatorForm />

      {/* Disclaimer */}
      <p className="mt-10 text-center text-xs text-muted-foreground">
        Калькулятор предназначен для информационных целей. Не является медицинским
        диагнозом. Проконсультируйтесь с врачом для интерпретации результатов.
      </p>
    </div>
  );
}
