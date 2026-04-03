"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { MARKERS, calculatePhenoAge, type BiomarkerInput, type PhenoAgeResult } from "@/lib/phenoage";
import { CalculatorResult } from "@/components/calculator/calculator-result";

const schema = z.object({
  age: z.coerce.number().min(18, "Минимум 18 лет").max(120, "Максимум 120 лет"),
  albumin: z.coerce.number().positive("Введите значение"),
  creatinine: z.coerce.number().positive("Введите значение"),
  glucose: z.coerce.number().positive("Введите значение"),
  crp: z.coerce.number().positive("Введите значение"),
  lymphocyte: z.coerce.number().positive("Введите значение"),
  mcv: z.coerce.number().positive("Введите значение"),
  rdw: z.coerce.number().positive("Введите значение"),
  alp: z.coerce.number().positive("Введите значение"),
  wbc: z.coerce.number().positive("Введите значение"),
});

type FormValues = z.infer<typeof schema>;

export function CalculatorForm() {
  const [result, setResult] = useState<PhenoAgeResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    const res = calculatePhenoAge(data as BiomarkerInput);
    setResult(res);
    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Введите данные анализа крови
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Age field */}
            <div className="space-y-2">
              <Label htmlFor="age">Возраст (полных лет)</Label>
              <Input
                id="age"
                type="number"
                placeholder="35"
                {...register("age")}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>

            {/* Biomarker fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {MARKERS.map((marker) => (
                <div key={marker.key} className="space-y-1.5">
                  <Label htmlFor={marker.key} className="text-sm">
                    {marker.nameRu}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({marker.nameEn}), {marker.unit}
                    </span>
                  </Label>
                  <Input
                    id={marker.key}
                    type="number"
                    step="any"
                    placeholder={marker.placeholder}
                    {...register(marker.key)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Оптимум: {marker.optimalMin}–{marker.optimalMax} {marker.unit}
                  </p>
                  {errors[marker.key] && (
                    <p className="text-sm text-destructive">
                      {errors[marker.key]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" size="lg" className="w-full">
              Рассчитать биологический возраст
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div id="result" className="mt-8">
          <CalculatorResult result={result} />
        </div>
      )}
    </>
  );
}
