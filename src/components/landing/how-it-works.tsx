import { Dna, FlaskConical, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Dna,
    step: "1",
    title: "Выберите тест",
    description: "Посмотрите каталог — от спортивной генетики до фармакогенетики. Не знаете, с чего начать? Начните с генетического паспорта.",
  },
  {
    icon: FlaskConical,
    step: "2",
    title: "Сдайте биоматериал",
    description: "Буккальный эпителий (мазок со щеки) — это не больно и занимает 30 секунд. В лаборатории или с выездом на дом.",
  },
  {
    icon: Sparkles,
    step: "3",
    title: "Получите результат",
    description: "Через 14–30 рабочих дней в личном кабинете появится детальный отчёт с расшифровкой и рекомендациями.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t bg-muted/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Как это работает
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <s.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {s.step}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
