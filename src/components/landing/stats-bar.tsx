import { TestTube, FolderOpen, Banknote, Clock } from "lucide-react";

const stats = [
  { value: "80+", label: "генетических тестов", icon: TestTube },
  { value: "14", label: "категорий исследований", icon: FolderOpen },
  { value: "от 1 300 ₽", label: "стоимость теста", icon: Banknote },
  { value: "14–30", label: "рабочих дней результат", icon: Clock },
];

export function StatsBar() {
  return (
    <section className="border-y bg-primary/5">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
