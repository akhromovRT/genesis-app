import { FileText, Target, LayoutDashboard, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: FileText,
    title: "Понятный отчёт",
    description: "Не просто PDF с цифрами. Расшифровка на человеческом языке: что означают ваши гены и на что обратить внимание.",
  },
  {
    icon: Target,
    title: "Персональные рекомендации",
    description: "Каждая рекомендация учитывает именно ваш генотип. Не общие советы из интернета, а конкретный план для вас.",
  },
  {
    icon: LayoutDashboard,
    title: "Всё в одном месте",
    description: "Личный кабинет с историей всех тестов и результатов. Отслеживайте своё здоровье в динамике.",
  },
  {
    icon: BookOpen,
    title: "Доказательная база",
    description: "Все интерпретации основаны на научных исследованиях. Мы указываем источники и уровень доказательности.",
  },
];

export function Benefits() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Почему Genesis</h2>
          <p className="mt-3 text-muted-foreground">
            Мы превращаем генетические данные в понятные и полезные знания о вашем здоровье
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {benefits.map((b) => (
            <Card key={b.title} className="border-0 bg-muted/50 shadow-none">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
