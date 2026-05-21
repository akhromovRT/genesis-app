"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Step1Answers } from "@/lib/questionnaire/types";
import {
  computeQuickInsights,
  type RiskCategory,
  type GraceCategory,
  type BMICategory,
} from "@/lib/questionnaire/quick-insights";

interface Props {
  step1: Step1Answers;
  onContinue: () => void;
  onBack: () => void;
}

const RISK_VARIANT: Record<RiskCategory, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  moderate: "default",
  high: "destructive",
};

const BMI_VARIANT: Record<BMICategory, "default" | "secondary" | "destructive"> = {
  underweight: "default",
  normal: "secondary",
  overweight: "default",
  obese1: "destructive",
  obese2: "destructive",
  obese3: "destructive",
};

const GRACE_VARIANT: Record<GraceCategory, "secondary" | "default"> = {
  thin: "default",
  harmonious: "secondary",
  dense: "default",
};

export function StepQuickInsights({ step1, onContinue, onBack }: Props) {
  const insights = computeQuickInsights(step1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваш мгновенный результат</CardTitle>
        <p className="text-sm text-muted-foreground">
          Это предварительный срез по антропометрии. Чтобы узнать биологический
          возраст и получить персональные подсветки — продолжите анкету.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Возраст</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{insights.age} лет</div>
            </CardContent>
          </Card>

          {insights.bmi && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Индекс массы тела
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{insights.bmi.value}</div>
                <Badge variant={BMI_VARIANT[insights.bmi.category]} className="mt-1">
                  {insights.bmi.label}
                </Badge>
              </CardContent>
            </Card>
          )}

          {insights.waistRisk && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Окружность талии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {insights.waistRisk.value} см
                </div>
                <Badge
                  variant={RISK_VARIANT[insights.waistRisk.category]}
                  className="mt-1"
                >
                  {insights.waistRisk.label}
                </Badge>
              </CardContent>
            </Card>
          )}

          {insights.whr && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Соотношение талия/бёдра (WHR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{insights.whr.value}</div>
                <Badge variant={RISK_VARIANT[insights.whr.category]} className="mt-1">
                  {insights.whr.label}
                </Badge>
              </CardContent>
            </Card>
          )}

          {insights.indexOfGrace && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Индекс грации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {insights.indexOfGrace.value}
                </div>
                <Badge
                  variant={GRACE_VARIANT[insights.indexOfGrace.category]}
                  className="mt-1"
                >
                  {insights.indexOfGrace.label}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="rounded-md bg-muted/50 p-4 text-xs text-muted-foreground">
          Эти показатели — субъективные ориентиры. Они не являются медицинским
          диагнозом. Полный персональный отчёт с дефицитами нутриентов, фарм-нагрузкой
          и образом жизни доступен после прохождения всей анкеты (~20 минут).
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Назад
          </Button>
          <Button type="button" onClick={onContinue}>
            Продолжить — узнать о биовозрасте
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
