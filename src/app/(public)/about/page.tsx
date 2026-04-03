import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Check, Minus } from "lucide-react";

export const metadata: Metadata = {
  title: "О нас",
  description: "Genesis — персональная операционная система здоровья и долголетия. Наш научный подход и видение будущего.",
};

const competitors = [
  { name: "InsideTracker", genetics: false, blood: true, microbiome: false, wearables: "partial", protocol: false, narrative: false },
  { name: "23andMe", genetics: true, blood: false, microbiome: false, wearables: false, protocol: false, narrative: false },
  { name: "Viome", genetics: false, blood: false, microbiome: true, wearables: false, protocol: false, narrative: false },
  { name: "WHOOP / Oura", genetics: false, blood: false, microbiome: false, wearables: true, protocol: false, narrative: false },
  { name: "Genesis", genetics: true, blood: true, microbiome: true, wearables: true, protocol: true, narrative: true },
];

function CellIcon({ value }: { value: boolean | string }) {
  if (value === true || value === "partial") {
    return <Check className={`h-4 w-4 mx-auto ${value === "partial" ? "text-muted-foreground" : "text-primary"}`} />;
  }
  return <Minus className="h-4 w-4 mx-auto text-muted-foreground/40" />;
}

const pyramidLevels = [
  { level: "1", name: "Диагностика и анализ", desc: "Генетика, биомаркеры, биологический возраст" },
  { level: "2", name: "Образ жизни", desc: "Упражнения, питание, сон, управление стрессом" },
  { level: "3", name: "Нутрицевтики", desc: "Персональный стек добавок на основе данных" },
  { level: "4", name: "Процедуры", desc: "Сауна, криотерапия, гипербарическая оксигенация" },
  { level: "5", name: "Экспериментальное", desc: "Новейшие научные подходы (образовательный контент)" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Mission */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight">О Genesis</h1>
        <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Genesis делает генетику доступной и полезной. Мы верим, что каждый
            человек имеет право понимать свой организм — не через сложные таблицы
            и непонятные аббревиатуры, а через ясные объяснения и конкретные
            рекомендации.
          </p>
          <p>
            Наша цель — превратить генетические данные в инструмент ежедневных
            решений о здоровье. Не заменить врача, а помочь вам и вашему врачу
            принимать более точные решения.
          </p>
        </div>
      </section>

      {/* Scientific approach */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight">Научный подход</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Наш подход основан на фреймворке{" "}
          <strong className="text-foreground">Longevity Pyramid</strong>{" "}
          (Martinović et al., 2024, <em>Frontiers in Aging</em>) —
          пятиуровневой модели доказательных стратегий долголетия.
        </p>
        <div className="mt-8 space-y-3">
          {pyramidLevels.map((l) => (
            <Card key={l.level} className="border-0 bg-muted/50 shadow-none">
              <CardContent className="flex items-start gap-4 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {l.level}
                </span>
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Мы используем лонжевити-оптимальные диапазоны биомаркеров вместо
          стандартных лабораторных референсов. Каждая интерпретация подкреплена
          ссылками на научные исследования.
        </p>
      </section>

      {/* Comparison */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight">Чем мы отличаемся</h2>
        <div className="mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40"></TableHead>
                <TableHead className="text-center">Генетика</TableHead>
                <TableHead className="text-center">Кровь</TableHead>
                <TableHead className="text-center">Микробиом</TableHead>
                <TableHead className="text-center">Wearables</TableHead>
                <TableHead className="text-center">AI-протокол</TableHead>
                <TableHead className="text-center">Нарратив</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((c) => (
                <TableRow key={c.name} className={c.name === "Genesis" ? "bg-primary/5 font-medium" : ""}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><CellIcon value={c.genetics} /></TableCell>
                  <TableCell><CellIcon value={c.blood} /></TableCell>
                  <TableCell><CellIcon value={c.microbiome} /></TableCell>
                  <TableCell><CellIcon value={c.wearables} /></TableCell>
                  <TableCell><CellIcon value={c.protocol} /></TableCell>
                  <TableCell><CellIcon value={c.narrative} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Vision */}
      <section className="mt-16 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Куда мы идём</h2>
        <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Сегодня Genesis — это генетические тесты с понятной расшифровкой.
          </p>
          <p>
            Завтра — полная экосистема здоровья: импорт анализов крови, трекинг
            биомаркеров, расчёт биологического возраста, персональный AI-протокол
            и <strong className="text-foreground">Genesis Coach</strong> — ваш
            личный ассистент здоровья.
          </p>
        </div>
      </section>
    </div>
  );
}
