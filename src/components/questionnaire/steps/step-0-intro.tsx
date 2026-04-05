"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Lightbulb } from "lucide-react";

interface Props {
  onNext: () => void;
}

export function Step0Intro({ onNext }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Биохакинг-анкета</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Полный анамнез по образу жизни, питанию и здоровью за ~25 минут.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">9 шагов, ~25 минут</p>
              <p className="text-sm text-muted-foreground">Прогресс сохраняется автоматически. Можно выйти и вернуться.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Что вы получите</p>
              <p className="text-sm text-muted-foreground">
                Структурированную сводку ответов + автоматические подсветки рисков по 15 правилам (дефициты, фарм-нагрузка, образ жизни).
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Это не медицинская услуга</p>
              <p className="text-sm text-muted-foreground">
                Программа оздоровления относится к сфере ЗОЖ/натуропрактики, не является медицинской услугой и не ставит диагнозы. Все подсветки — поводы обсудить со специалистом.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onNext} size="lg" className="w-full">Начать анкету</Button>
    </div>
  );
}
