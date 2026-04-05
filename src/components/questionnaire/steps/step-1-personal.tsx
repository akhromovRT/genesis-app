"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Step1Schema, type Step1Answers } from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

export function Step1Personal({ value, onChange, onNext, onBack }: StepProps<Step1Answers>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step1Answers>({
    resolver: zodResolver(Step1Schema),
    defaultValues: value ?? {
      birthDate: "",
      city: "",
      timezone: "Europe/Moscow",
      height: 170,
      weight: 70,
    } as any,
  });

  const gender = watch("gender");

  function onSubmit(data: Step1Answers) {
    onChange(data);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>О себе</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Пол</Label>
            <Select value={gender ?? ""} onValueChange={(v) => setValue("gender", v as any, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="f">Женский</SelectItem>
                <SelectItem value="m">Мужской</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} />
            {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">Город</Label>
              <Input id="city" placeholder="Москва" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Часовой пояс</Label>
              <Input id="timezone" placeholder="Europe/Moscow" {...register("timezone")} />
              {errors.timezone && <p className="text-xs text-destructive">{errors.timezone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="height">Рост (см)</Label>
              <Input id="height" type="number" {...register("height", { valueAsNumber: true })} />
              {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Вес (кг)</Label>
              <Input id="weight" type="number" step="0.1" {...register("weight", { valueAsNumber: true })} />
              {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="waist">Талия (см)</Label>
              <Input id="waist" type="number" {...register("waist", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hips">Бёдра (см)</Label>
              <Input id="hips" type="number" {...register("hips", { valueAsNumber: true })} />
            </div>
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
