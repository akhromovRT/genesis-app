"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FrequencyTable } from "../shared/frequency-table";
import {
  MEDICATION_GROUPS,
  SUPPLEMENT_GROUPS,
  type Step6Answers,
  type Frequency,
} from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

const MED_LABELS: Record<string, string> = {
  antiplatelet: "Антиагреганты / антикоагулянты",
  bloodPressureHeart: "Препараты от давления / для сердца",
  microcirculation: "Препараты для микроциркуляции",
  venotonic: "Венотоники",
  antidepressants: "Антидепрессанты",
  neuroleptics: "Нейролептики / антипсихотики",
  anxietySleep: "Препараты от тревоги / для сна",
  anticonvulsants: "Противосудорожные",
  stomach: "Препараты для желудка",
  enzymesBile: "Ферменты / желчегонные",
  laxatives: "Послабляющие",
  antidiarrheal: "Препараты от диареи",
  thyroidHormones: "Гормоны щитовидной железы",
  hormonal: "Гормональные препараты",
  diabetes: "Препараты при диабете",
  nsaids: "НПВС",
  spasmolytics: "Спазмолитики",
  gout: "Препараты от подагры",
  antibiotics: "Антибиотики",
  antivirals: "Противовирусные",
  antifungals: "Противогрибковые",
  detoxAcetylation: "Препараты для детоксикации / ацетилирования",
  hepatoprotectors: "Гепатопротекторы",
};

const SUPP_LABELS: Record<string, string> = {
  vitaminsMinerals: "Витамины и минералы",
  omega3: "Омега-3",
  probioticsPrebiotics: "Пробиотики / пребиотики",
  antioxidants: "Антиоксиданты",
  adaptogens: "Адаптогены",
  aminoAcidsSportsNut: "Аминокислоты / спортпит",
  collagenJoints: "Коллаген / суставные добавки",
  brainCognitive: "Для мозга / когнитивной поддержки",
  other: "Другое",
};

type Entry = { frequency: Frequency; nameAndDosage?: string };

export function Step6Medications({ value, onChange, onNext, onBack }: StepProps<Step6Answers>) {
  const [medications, setMedications] = useState<Record<string, Entry>>(
    (value?.medications as Record<string, Entry>) ?? {}
  );
  const [supplements, setSupplements] = useState<Record<string, Entry>>(
    (value?.supplements as Record<string, Entry>) ?? {}
  );
  const [additionalMedications, setAdditionalMedications] = useState(value?.additionalMedications ?? "");
  const [trustedBrands, setTrustedBrands] = useState(value?.trustedBrands ?? "");
  const [noBrandPreference, setNoBrandPreference] = useState(value?.noBrandPreference ?? false);

  function handleSubmit() {
    onChange({
      medications,
      supplements,
      additionalMedications,
      trustedBrands,
      noBrandPreference,
    });
    onNext();
  }

  const medRows = MEDICATION_GROUPS.map((k) => ({ key: k, label: MED_LABELS[k] }));
  const suppRows = SUPPLEMENT_GROUPS.map((k) => ({ key: k, label: SUPP_LABELS[k] }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Лекарства</CardTitle>
          <p className="text-sm text-muted-foreground">
            Отметьте частоту приёма и укажите название/дозировку.
          </p>
        </CardHeader>
        <CardContent>
          <FrequencyTable
            rows={medRows}
            values={medications}
            onChange={(k, v) => setMedications((prev) => ({ ...prev, [k]: v }))}
          />
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="additional">Дополнительные лекарства</Label>
            <Textarea
              id="additional"
              rows={2}
              value={additionalMedications}
              onChange={(e) => setAdditionalMedications(e.target.value)}
              placeholder="Что ещё важно указать"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>БАД</CardTitle>
        </CardHeader>
        <CardContent>
          <FrequencyTable
            rows={suppRows}
            values={supplements}
            onChange={(k, v) => setSupplements((prev) => ({ ...prev, [k]: v }))}
          />
          <div className="mt-4 space-y-2">
            <Label htmlFor="brands">Бренды, которым доверяете</Label>
            <Input
              id="brands"
              value={trustedBrands}
              onChange={(e) => setTrustedBrands(e.target.value)}
              disabled={noBrandPreference}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="noBrand"
                checked={noBrandPreference}
                onCheckedChange={(v) => setNoBrandPreference(v === true)}
              />
              <Label htmlFor="noBrand" className="text-sm font-normal">
                Нет предпочтений
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>Назад</Button>
        <Button type="button" onClick={handleSubmit}>Далее</Button>
      </div>
    </div>
  );
}
