"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Step5Schema, type Step5Answers } from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

export function Step5StressAllergies({ value, onChange, onNext, onBack }: StepProps<Step5Answers>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step5Answers>({
    resolver: zodResolver(Step5Schema),
    defaultValues: value ?? {} as any,
  });

  const stressLevel = watch("stressLevel");

  function onSubmit(data: Step5Answers) {
    onChange(data);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Стресс и аллергии</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="emotionalState">Эмоциональное состояние</Label>
            <Textarea id="emotionalState" rows={2} {...register("emotionalState")} />
            {errors.emotionalState && <p className="text-xs text-destructive">{errors.emotionalState.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Уровень стресса (1 — минимум, 5 — максимум)</Label>
            <Select
              value={stressLevel !== undefined ? String(stressLevel) : ""}
              onValueChange={(v) => setValue("stressLevel", Number(v), { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stressLevel && <p className="text-xs text-destructive">{errors.stressLevel.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pollinosis">Поллинозы, сезонные аллергии</Label>
            <Input id="pollinosis" {...register("pollinosis")} />
            {errors.pollinosis && <p className="text-xs text-destructive">{errors.pollinosis.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="foodAllergies">Пищевая аллергия</Label>
            <Input id="foodAllergies" {...register("foodAllergies")} />
            {errors.foodAllergies && <p className="text-xs text-destructive">{errors.foodAllergies.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="drugAllergies">Лекарственная аллергия / непереносимость</Label>
            <Input id="drugAllergies" {...register("drugAllergies")} />
            {errors.drugAllergies && <p className="text-xs text-destructive">{errors.drugAllergies.message}</p>}
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>Назад</Button>
            <Button type="submit">Далее</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
