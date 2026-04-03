import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Dumbbell, Baby, Leaf, ArrowRight } from "lucide-react";

const personas = [
  {
    icon: ShieldCheck,
    title: "Хочу понять свои риски",
    description: "Вам 40+ и вы хотите знать, на что обратить внимание. Генетический паспорт покажет предрасположенности и поможет выбрать правильные чекапы.",
    href: "/catalog?category=geneticheskie-pasporta",
  },
  {
    icon: Dumbbell,
    title: "Оптимизирую тренировки",
    description: "Узнайте свой тип мышечных волокон, выносливость и риск травм. Подберите тренировки под свою генетику.",
    href: "/catalog?category=sportivnaya-genetika",
  },
  {
    icon: Baby,
    title: "Планирую беременность",
    description: "Генетическое обследование до зачатия поможет выявить риски и подготовиться к здоровой беременности.",
    href: "/catalog?category=reproduktivnoe-zdorove",
  },
  {
    icon: Leaf,
    title: "Интересуюсь биохакингом",
    description: "Нутригеномика, метаболизм витаминов, детоксикация — оптимизируйте здоровье на основе данных, а не догадок.",
    href: "/catalog?category=nutrigenomika-i-vitaminy",
  },
];

export function Personas() {
  return (
    <section className="border-t bg-muted/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Для кого это
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Найдите свою причину узнать свою генетику
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {personas.map((p) => (
            <Link key={p.title} href={p.href}>
              <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <p.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">«{p.title}»</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                      Подробнее <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
