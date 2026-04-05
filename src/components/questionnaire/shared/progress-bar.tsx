"use client";
import { Progress } from "@/components/ui/progress";
import { TOTAL_STEPS, getRemainingMinutes } from "@/lib/questionnaire/steps-config";

interface Props {
  currentStep: number;
}

export function QuestionnaireProgressBar({ currentStep }: Props) {
  const percent = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);
  const remaining = getRemainingMinutes(currentStep);
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Шаг {currentStep} из {TOTAL_STEPS - 1}
          </span>
          <span>~{remaining} мин осталось</span>
        </div>
        <Progress value={percent} />
      </div>
    </div>
  );
}
