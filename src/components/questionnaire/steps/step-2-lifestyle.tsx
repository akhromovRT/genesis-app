"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Step2Schema, type Step2Answers } from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

export function Step2Lifestyle({ value, onChange, onNext, onBack }: StepProps<Step2Answers>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step2Answers>({
    resolver: zodResolver(Step2Schema),
    defaultValues: value ?? {} as any,
  });

  const physicalActivity = watch("physicalActivity");
  const sleepQuality = watch("sleepQuality");
  const waterIntake = watch("waterIntake");

  function onSubmit(data: Step2Answers) {
    onChange(data);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Образ жизни</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="workDescription">Характер работы (кратко)</Label>
            <Textarea id="workDescription" rows={2} {...register("workDescription")} />
            {errors.workDescription && <p className="text-xs text-destructive">{errors.workDescription.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Уровень физической активности</Label>
            <Select
              value={physicalActivity ?? ""}
              onValueChange={(v) => setValue("physicalActivity", v as any, { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
            {errors.physicalActivity && <p className="text-xs text-destructive">{errors.physicalActivity.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activityDescription">Описание физической нагрузки</Label>
            <Textarea id="activityDescription" rows={2} {...register("activityDescription")} />
            {errors.activityDescription && <p className="text-xs text-destructive">{errors.activityDescription.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="wakeTime">Время подъёма</Label>
              <Input id="wakeTime" type="time" {...register("wakeTime")} />
              {errors.wakeTime && <p className="text-xs text-destructive">{errors.wakeTime.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sleepTime">Время отхода ко сну</Label>
              <Input id="sleepTime" type="time" {...register("sleepTime")} />
              {errors.sleepTime && <p className="text-xs text-destructive">{errors.sleepTime.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Качество сна (0-5)</Label>
            <Select
              value={sleepQuality !== undefined ? String(sleepQuality) : ""}
              onValueChange={(v) => setValue("sleepQuality", Number(v), { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sleepQuality && <p className="text-xs text-destructive">{errors.sleepQuality.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mealsPerDayWeekday">Приёмов пищи (будни)</Label>
              <Input id="mealsPerDayWeekday" type="number" {...register("mealsPerDayWeekday", { valueAsNumber: true })} />
              {errors.mealsPerDayWeekday && <p className="text-xs text-destructive">{errors.mealsPerDayWeekday.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mealsPerDayWeekend">Приёмов пищи (выходные)</Label>
              <Input id="mealsPerDayWeekend" type="number" {...register("mealsPerDayWeekend", { valueAsNumber: true })} />
              {errors.mealsPerDayWeekend && <p className="text-xs text-destructive">{errors.mealsPerDayWeekend.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="breakfastTimeWeekday">Завтрак (будни)</Label>
              <Input id="breakfastTimeWeekday" type="time" {...register("breakfastTimeWeekday")} />
              {errors.breakfastTimeWeekday && <p className="text-xs text-destructive">{errors.breakfastTimeWeekday.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastMealTimeWeekday">Последний приём (будни)</Label>
              <Input id="lastMealTimeWeekday" type="time" {...register("lastMealTimeWeekday")} />
              {errors.lastMealTimeWeekday && <p className="text-xs text-destructive">{errors.lastMealTimeWeekday.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="breakfastTimeWeekend">Завтрак (выходные)</Label>
              <Input id="breakfastTimeWeekend" type="time" {...register("breakfastTimeWeekend")} />
              {errors.breakfastTimeWeekend && <p className="text-xs text-destructive">{errors.breakfastTimeWeekend.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastMealTimeWeekend">Последний приём (выходные)</Label>
              <Input id="lastMealTimeWeekend" type="time" {...register("lastMealTimeWeekend")} />
              {errors.lastMealTimeWeekend && <p className="text-xs text-destructive">{errors.lastMealTimeWeekend.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Вода в день</Label>
            <Select
              value={waterIntake ?? ""}
              onValueChange={(v) => setValue("waterIntake", v as any, { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="<0.5">Менее 0.5 л</SelectItem>
                <SelectItem value="0.5-1">0.5–1 л</SelectItem>
                <SelectItem value="1-1.5">1–1.5 л</SelectItem>
                <SelectItem value=">1.5">Более 1.5 л</SelectItem>
                <SelectItem value="2+">2 и более л</SelectItem>
              </SelectContent>
            </Select>
            {errors.waterIntake && <p className="text-xs text-destructive">{errors.waterIntake.message}</p>}
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
