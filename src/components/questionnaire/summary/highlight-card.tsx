"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info, ChevronDown } from "lucide-react";
import type { Highlight } from "@/lib/questionnaire/rules";

const SEVERITY_STYLES = {
  warning: {
    icon: AlertTriangle,
    className: "border-red-200 bg-red-50 dark:bg-red-950/20",
    iconClass: "text-red-600",
  },
  attention: {
    icon: AlertCircle,
    className: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
    iconClass: "text-amber-600",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
    iconClass: "text-blue-600",
  },
};

export function HighlightCard({ highlight }: { highlight: Highlight }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[highlight.severity];
  const Icon = style.icon;
  return (
    <Card className={style.className}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.iconClass}`} />
          <div className="flex-1">
            <h4 className="font-medium">{highlight.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{highlight.description}</p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
              {expanded ? "Скрыть детали" : "Что привело к этому выводу"}
            </button>
            {expanded && (
              <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Триггеры:</p>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {highlight.triggers.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Рекомендация:</p>
                  <p>{highlight.recommendation}</p>
                </div>
                <p className="text-xs text-muted-foreground italic pt-2 border-t">
                  {highlight.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
