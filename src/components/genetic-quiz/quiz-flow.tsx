"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QUIZ_QUESTIONS,
  MIN_SELECTION,
  TOTAL_GENE_POINTS,
  BLOCK_1_PRICE_RUB,
} from "@/lib/genetic-quiz/questions";
import {
  getMatchedMarkers,
  groupMarkersByGene,
  isSelectionValid,
  selectionCoversAll,
} from "@/lib/genetic-quiz/quiz-logic";

const priceLabel = new Intl.NumberFormat("ru-RU").format(BLOCK_1_PRICE_RUB);

export function GeneticQuizFlow() {
  const [selected, setSelected] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setShowResult(false);
  }

  const valid = isSelectionValid(selected);
  const matched = showResult ? getMatchedMarkers(selected) : [];
  const grouped = groupMarkersByGene(matched);
  const coversAll = selectionCoversAll(selected);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {QUIZ_QUESTIONS.map((q) => {
          const checked = selected.includes(q.id);
          return (
            <Card
              key={q.id}
              className={checked ? "border-primary" : undefined}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Checkbox
                  id={`q-${q.id}`}
                  checked={checked}
                  onCheckedChange={() => toggle(q.id)}
                  className="mt-1"
                />
                <label htmlFor={`q-${q.id}`} className="cursor-pointer">
                  <span className="font-medium">{q.question}</span>
                  <span className="block text-sm text-muted-foreground">
                    {q.intent}
                  </span>
                </label>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Выбрано {selected.length}{" "}
            {valid ? "" : `(минимум ${MIN_SELECTION})`}
          </p>
          <Button
            type="button"
            disabled={!valid}
            onClick={() => setShowResult(true)}
          >
            Узнать, что покажет моя ДНК
          </Button>
        </div>
      </div>

      {showResult && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Что расскажет твоя ДНК-карта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {coversAll ? (
                <>
                  Твой запрос покрывает <strong>всю панель</strong> —{" "}
                  {TOTAL_GENE_POINTS} генетических точек.
                </>
              ) : (
                <>
                  По выбранным вопросам твою ДНК-карту можно прочитать по{" "}
                  <strong>{matched.length}</strong> генетическим точкам из{" "}
                  {TOTAL_GENE_POINTS} в панели.
                </>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {grouped.map((g) => (
                <Badge key={g.gene} variant="secondary">
                  {g.gene} ({g.rsList.length})
                </Badge>
              ))}
            </div>

            <div className="rounded-md bg-muted/50 p-4 text-xs text-muted-foreground">
              Это предварительная карта соответствия твоих вопросов генетическим
              маркерам панели. Не является медицинским диагнозом. Полная
              интерпретация — в отчёте после генетического теста.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div>
                <div className="text-sm text-muted-foreground">
                  Полный отчёт «Стройность и питание без угадывания»
                </div>
                <div className="text-2xl font-semibold">{priceLabel} ₽</div>
                <div className="text-xs text-muted-foreground">
                  {TOTAL_GENE_POINTS} генетических точек
                </div>
              </div>
              <Link href="/catalog">
                <Button size="lg">Получить полный отчёт</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
