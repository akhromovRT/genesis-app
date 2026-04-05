"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QuestionnaireProgressBar } from "./shared/progress-bar";
import { TOTAL_STEPS } from "@/lib/questionnaire/steps-config";
import { loadSession, saveSession, clearSession } from "@/lib/questionnaire/storage";
import type { FullAnswers } from "@/lib/questionnaire/types";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import { Step0Intro } from "./steps/step-0-intro";
import { Step1Personal } from "./steps/step-1-personal";
import { Step2Lifestyle } from "./steps/step-2-lifestyle";
import { Step3History } from "./steps/step-3-history";
import { Step4Systems } from "./steps/step-4-systems";
import { Step5StressAllergies } from "./steps/step-5-stress-allergies";
import { Step6Medications } from "./steps/step-6-medications";
import { Step7Nutrition } from "./steps/step-7-nutrition";
import { Step8SymptomsGoals } from "./steps/step-8-symptoms-goals";

export interface StepProps<T> {
  value: T | undefined;
  onChange: (value: T) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuestionnaireWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<FullAnswers>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setAnswers(saved.answers);
      setCurrentStep(saved.currentStep);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveSession(currentStep, answers);
  }, [currentStep, answers, loaded]);

  function updateStep<K extends keyof FullAnswers>(key: K, value: FullAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submitFinal() {
    const parsed = CompletedAnswersSchema.safeParse(answers);
    if (!parsed.success) {
      toast.error("Заполните все обязательные поля на всех шагах");
      return;
    }
    const session = saveSession(currentStep, answers);
    try {
      const res = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: session.sessionToken,
          answers: parsed.data,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      toast.success("Анкета отправлена");
      router.push(`/questionnaire/result/${session.sessionToken}`);
    } catch {
      toast.error("Ошибка отправки. Попробуйте ещё раз.");
    }
  }

  function saveAndExit() {
    saveSession(currentStep, answers);
    toast.info("Прогресс сохранён в этом браузере");
  }

  function startOver() {
    if (!confirm("Удалить прогресс и начать заново?")) return;
    clearSession();
    setAnswers({});
    setCurrentStep(0);
  }

  if (!loaded) return null;

  return (
    <div>
      {currentStep > 0 && <QuestionnaireProgressBar currentStep={currentStep} />}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {currentStep > 0 && (
          <div className="mb-4 flex justify-between text-sm">
            <button type="button" onClick={startOver} className="text-muted-foreground hover:text-foreground underline">
              Начать заново
            </button>
            <button type="button" onClick={saveAndExit} className="text-muted-foreground hover:text-foreground underline">
              Сохранить и выйти
            </button>
          </div>
        )}
        {currentStep === 0 && <Step0Intro onNext={goNext} />}
        {currentStep === 1 && <Step1Personal value={answers.step1} onChange={(v) => updateStep("step1", v)} onNext={goNext} onBack={goBack} />}
        {currentStep === 2 && <Step2Lifestyle value={answers.step2} onChange={(v) => updateStep("step2", v)} onNext={goNext} onBack={goBack} />}
        {currentStep === 3 && <Step3History value={answers.step3} onChange={(v) => updateStep("step3", v)} onNext={goNext} onBack={goBack} />}
        {currentStep === 4 && <Step4Systems value={answers.step4} onChange={(v) => updateStep("step4", v)} onNext={goNext} onBack={goBack} />}
        {currentStep === 5 && <Step5StressAllergies value={answers.step5} onChange={(v) => updateStep("step5", v)} onNext={goNext} onBack={goBack} />}
        {currentStep === 6 && <Step6Medications value={answers.step6} onChange={(v) => updateStep("step6", v)} onNext={goNext} onBack={goBack} />}
        {currentStep === 7 && <Step7Nutrition value={answers.step7} onChange={(v) => updateStep("step7", v)} onNext={goNext} onBack={goBack} />}
        {currentStep === 8 && <Step8SymptomsGoals value={answers.step8} onChange={(v) => updateStep("step8", v)} onNext={submitFinal} onBack={goBack} />}
      </div>
    </div>
  );
}
