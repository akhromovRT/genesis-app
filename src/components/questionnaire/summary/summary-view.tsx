"use client";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HighlightsPanel } from "./highlights-panel";
import type { Highlight } from "@/lib/questionnaire/rules";
import type { CompletedAnswers } from "@/lib/questionnaire/types";

interface Props {
  answers: CompletedAnswers;
  highlights: Highlight[];
}

const GENDER_LABELS: Record<string, string> = { f: "Женский", m: "Мужской", other: "Другое" };

export function SummaryView({ answers, highlights }: Props) {
  return (
    <div className="space-y-8">
      <HighlightsPanel highlights={highlights} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Ваши ответы</h3>
        <Accordion multiple className="space-y-2">
          <AccordionItem value="step1" className="border rounded-lg px-4">
            <AccordionTrigger>О себе</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-1 text-sm">
                <div><dt className="inline font-medium">Пол: </dt><dd className="inline">{GENDER_LABELS[answers.step1.gender] ?? answers.step1.gender}</dd></div>
                <div><dt className="inline font-medium">Дата рождения: </dt><dd className="inline">{answers.step1.birthDate}</dd></div>
                <div><dt className="inline font-medium">Город: </dt><dd className="inline">{answers.step1.city}</dd></div>
                <div><dt className="inline font-medium">Рост/вес: </dt><dd className="inline">{answers.step1.height} см / {answers.step1.weight} кг</dd></div>
                {answers.step1.waist && (
                  <div><dt className="inline font-medium">ОТ/ОБ: </dt><dd className="inline">{answers.step1.waist} / {answers.step1.hips} см</dd></div>
                )}
              </dl>
            </AccordionContent>
          </AccordionItem>

          {(["step2", "step3", "step4", "step5", "step6", "step7", "step8"] as const).map((key) => {
            const titles: Record<string, string> = {
              step2: "Образ жизни",
              step3: "Анамнез",
              step4: "Системы организма",
              step5: "Стресс и аллергии",
              step6: "Лекарства и БАД",
              step7: "Питание",
              step8: "Симптомы и цели",
            };
            return (
              <AccordionItem key={key} value={key} className="border rounded-lg px-4">
                <AccordionTrigger>{titles[key]}</AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs overflow-auto bg-muted p-3 rounded max-h-96">
                    {JSON.stringify(answers[key], null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground italic">
            Результаты анкеты не являются медицинским диагнозом и не заменяют консультацию специалиста.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
