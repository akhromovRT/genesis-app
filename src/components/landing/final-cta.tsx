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
        <Link href="/catalog" className="mt-8 inline-block">
          <Button size="lg">
            Перейти в каталог
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          Результат через 14–30 рабочих дней. Тест сдаётся один раз.
        </p>
      </div>
    </section>
  );
}
