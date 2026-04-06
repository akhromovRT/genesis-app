import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="border-t bg-primary/5 py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Готовы узнать свою генетику?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Выберите тест и сделайте первый шаг к осознанному управлению здоровьем.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/catalog">
            <Button size="lg">
              Перейти в каталог
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/questionnaire">
            <Button variant="outline" size="lg">
              Пройти бесплатную анкету
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Результат через 14–30 рабочих дней. Тест сдаётся один раз.
        </p>
      </div>
    </section>
  );
}
