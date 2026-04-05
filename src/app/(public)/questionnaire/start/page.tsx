import type { Metadata } from "next";
import { QuestionnaireWizard } from "@/components/questionnaire/wizard";

export const metadata: Metadata = {
  title: "Анкета — прохождение | Genesis",
  robots: { index: false },
};

export default function QuestionnaireStartPage() {
  return <QuestionnaireWizard />;
}
