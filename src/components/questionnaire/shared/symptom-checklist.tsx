"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Frequency } from "@/lib/questionnaire/types";

interface Item {
  key: string;
  label: string;
}

interface Props {
  items: Item[];
  values: Record<string, Frequency>;
  onChange: (key: string, value: Frequency) => void;
}

const OPTS: { value: Frequency; label: string }[] = [
  { value: "never", label: "Никогда" },
  { value: "rarely", label: "Редко" },
  { value: "sometimes", label: "Иногда" },
  { value: "often", label: "Часто" },
];

export function SymptomChecklist({ items, values, onChange }: Props) {
  const filledCount = items.filter((i) => values[i.key] && values[i.key] !== "never").length;
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Отмечено состояний: <span className="font-medium text-foreground">{filledCount}</span> из{" "}
        {items.length}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const current = values[item.key] ?? "never";
          return (
            <div key={item.key} className="rounded border p-3">
              <div className="text-sm font-medium mb-2">{item.label}</div>
              <RadioGroup
                value={current}
                onValueChange={(v) => onChange(item.key, v as Frequency)}
                className="flex gap-4"
              >
                {OPTS.map((o) => (
                  <div key={o.value} className="flex items-center gap-1.5">
                    <RadioGroupItem value={o.value} id={`${item.key}-${o.value}`} />
                    <Label htmlFor={`${item.key}-${o.value}`} className="text-xs">
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        })}
      </div>
    </div>
  );
}
