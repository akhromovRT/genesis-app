"use client";
import { HighlightCard } from "./highlight-card";
import type { Highlight } from "@/lib/questionnaire/rules";

export function HighlightsPanel({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Автоматических подсветок не выявлено. Это не означает отсутствие рисков —
          только то, что правила не сработали на ваших ответах. Рекомендуем
          регулярные профилактические чекапы.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Автоматические подсветки ({highlights.length})</h3>
      {highlights.map((h) => (
        <HighlightCard key={h.id} highlight={h} />
      ))}
    </div>
  );
}
