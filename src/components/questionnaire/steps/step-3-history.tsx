"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Step3Schema, type Step3Answers } from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

export function Step3History({ value, onChange, onNext, onBack }: StepProps<Step3Answers>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Answers>({
    resolver: zodResolver(Step3Schema),
    defaultValues: value ?? {} as any,
  });

  function onSubmit(data: Step3Answers) {
    onChange(data);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анамнез</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="parentsDiseases">Болезни родителей</Label>
            <Textarea id="parentsDiseases" rows={3} {...register("parentsDiseases")} />
            {errors.parentsDiseases && <p className="text-xs text-destructive">{errors.parentsDiseases.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="relativesDiseases">Болезни ближайших родственников (сестры, братья, бабушки, дедушки)</Label>
            <Textarea id="relativesDiseases" rows={3} {...register("relativesDiseases")} />
            {errors.relativesDiseases && <p className="text-xs text-destructive">{errors.relativesDiseases.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chronicDiagnoses">Диагнозы, установленные врачом</Label>
            <Textarea id="chronicDiagnoses" rows={3} {...register("chronicDiagnoses")} />
            {errors.chronicDiagnoses && <p className="text-xs text-destructive">{errors.chronicDiagnoses.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="surgeries">Перенесённые операции</Label>
            <Textarea id="surgeries" rows={3} {...register("surgeries")} />
            {errors.surgeries && <p className="text-xs text-destructive">{errors.surgeries.message}</p>}
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
