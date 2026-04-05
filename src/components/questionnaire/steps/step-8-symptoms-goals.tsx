"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SymptomChecklist } from "../shared/symptom-checklist";
import { SYMPTOMS, type Step8Answers, type Frequency } from "@/lib/questionnaire/types";
import { SYMPTOM_LABELS } from "@/lib/questionnaire/rules";
import type { StepProps } from "../wizard";

export function Step8SymptomsGoals({ value, onChange, onNext, onBack }: StepProps<Step8Answers>) {
  const [symptoms, setSymptoms] = useState<Record<string, Frequency>>(
    (value?.symptoms as Record<string, Frequency>) ?? {}
  );
  const [goals, setGoals] = useState(value?.goals ?? "");
  const [readinessToChange, setReadinessToChange] = useState<"full" | "partial" | "unsure">(
    value?.readinessToChange ?? "partial"
  );
  const [consentPersonalData, setConsentPersonalData] = useState(value?.consentPersonalData ?? false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(value?.confirmAccuracy ?? false);

  const items = SYMPTOMS.map((s) => ({ key: s, label: SYMPTOM_LABELS[s] }));
  const canSubmit = consentPersonalData && confirmAccuracy;

  function handleSubmit() {
    onChange({
      symptoms,
      goals,
      readinessToChange,
      consentPersonalData,
      confirmAccuracy,
    });
    onNext();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Признаки нутриентной недостаточности</CardTitle>
          <p className="text-sm text-muted-foreground">
            Отметьте, как часто у вас встречаются следующие состояния.
          </p>
        </CardHeader>
        <CardContent>
          <SymptomChecklist
            items={items}
            values={symptoms}
            onChange={(k, v) => setSymptoms((prev) => ({ ...prev, [k]: v }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Цели и готовность к изменениям</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goals">Ваши цели/задачи/ожидания</Label>
            <Textarea
              id="goals"
              rows={3}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Какой результат хотите получить"
            />
          </div>

          <div className="space-y-2">
            <Label>Готовность к изменениям питания</Label>
            <RadioGroup
              value={readinessToChange}
              onValueChange={(v) => setReadinessToChange(v as "full" | "partial" | "unsure")}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="full" id="r-full" />
                <Label htmlFor="r-full" className="font-normal">Полностью готов(а)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="partial" id="r-partial" />
                <Label htmlFor="r-partial" className="font-normal">Частично готов(а)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="unsure" id="r-unsure" />
                <Label htmlFor="r-unsure" className="font-normal">Пока затрудняюсь ответить</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Подтверждение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="confirm"
              checked={confirmAccuracy}
              onCheckedChange={(v) => setConfirmAccuracy(v === true)}
            />
            <Label htmlFor="confirm" className="text-sm font-normal leading-relaxed">
              Подтверждаю, что предоставленные сведения о состоянии здоровья, образе жизни, питании, перенесённых заболеваниях, аллергиях и принимаемых препаратах — достоверны и полны.
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent"
              checked={consentPersonalData}
              onCheckedChange={(v) => setConsentPersonalData(v === true)}
            />
            <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
              Согласен(на) на обработку персональных данных в рамках программы оздоровления. Понимаю, что программа относится к сфере ЗОЖ/натуропрактики и не является медицинской услугой.
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>Назад</Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          Завершить анкету
        </Button>
      </div>
    </div>
  );
}
