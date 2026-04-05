"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Frequency } from "@/lib/questionnaire/types";

interface Row {
  key: string;
  label: string;
}

interface Props {
  rows: Row[];
  values: Record<string, { frequency: Frequency; nameAndDosage?: string }>;
  onChange: (
    key: string,
    value: { frequency: Frequency; nameAndDosage?: string }
  ) => void;
  showNameField?: boolean;
}

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "never", label: "Никогда" },
  { value: "rarely", label: "Редко" },
  { value: "sometimes", label: "Иногда" },
  { value: "often", label: "Часто" },
];

export function FrequencyTable({ rows, values, onChange, showNameField = true }: Props) {
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const current = values[row.key] ?? { frequency: "never" as Frequency };
        return (
          <div key={row.key} className="rounded-lg border p-3">
            <div className="text-sm font-medium mb-2">{row.label}</div>
            <div className="flex flex-wrap gap-3">
              <RadioGroup
                value={current.frequency}
                onValueChange={(v) =>
                  onChange(row.key, { ...current, frequency: v as Frequency })
                }
                className="flex flex-wrap gap-3"
              >
                {FREQ_OPTIONS.map((o) => (
                  <div key={o.value} className="flex items-center gap-1.5">
                    <RadioGroupItem value={o.value} id={`${row.key}-${o.value}`} />
                    <Label htmlFor={`${row.key}-${o.value}`} className="text-xs">
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {showNameField && (
              <Input
                className="mt-2 h-8 text-xs"
                placeholder="Название, дозировка"
                value={current.nameAndDosage ?? ""}
                onChange={(e) =>
                  onChange(row.key, {
                    ...current,
                    nameAndDosage: e.target.value,
                  })
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
