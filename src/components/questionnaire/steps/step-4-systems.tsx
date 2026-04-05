"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Step4Schema, type Step4Answers } from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

export function Step4Systems({ value, onChange, onNext, onBack }: StepProps<Step4Answers>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4Answers>({
    resolver: zodResolver(Step4Schema),
    defaultValues: value ?? {} as any,
  });

  function onSubmit(data: Step4Answers) {
    onChange(data);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Состояние систем организма</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="brainNervous">Голова, мозг, нервная система</Label>
            <Textarea id="brainNervous" rows={2} {...register("brainNervous")} />
            {errors.brainNervous && <p className="text-xs text-destructive">{errors.brainNervous.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vision">Зрение</Label>
            <Textarea id="vision" rows={2} {...register("vision")} />
            {errors.vision && <p className="text-xs text-destructive">{errors.vision.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ent">ЛОР (ухо, горло, нос)</Label>
            <Textarea id="ent" rows={2} {...register("ent")} />
            {errors.ent && <p className="text-xs text-destructive">{errors.ent.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cardiovascular">Сердечно-сосудистая система</Label>
            <Textarea id="cardiovascular" rows={2} {...register("cardiovascular")} />
            {errors.cardiovascular && <p className="text-xs text-destructive">{errors.cardiovascular.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="digestive">ЖКТ (кишечник, стул, запоры, газы)</Label>
            <Textarea id="digestive" rows={2} {...register("digestive")} />
            {errors.digestive && <p className="text-xs text-destructive">{errors.digestive.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urogenital">Мочеполовая система</Label>
            <Textarea id="urogenital" rows={2} {...register("urogenital")} />
            {errors.urogenital && <p className="text-xs text-destructive">{errors.urogenital.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urogenitalLastVisit">Крайний визит к урологу/гинекологу</Label>
            <Input id="urogenitalLastVisit" {...register("urogenitalLastVisit")} />
            {errors.urogenitalLastVisit && <p className="text-xs text-destructive">{errors.urogenitalLastVisit.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skinHairNails">Кожа, волосы, ногти</Label>
            <Textarea id="skinHairNails" rows={2} {...register("skinHairNails")} />
            {errors.skinHairNails && <p className="text-xs text-destructive">{errors.skinHairNails.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aestheticIssues">Эстетические проблемы возраста</Label>
            <Textarea id="aestheticIssues" rows={2} {...register("aestheticIssues")} />
            {errors.aestheticIssues && <p className="text-xs text-destructive">{errors.aestheticIssues.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="thyroid">Щитовидная железа</Label>
            <Textarea id="thyroid" rows={2} {...register("thyroid")} />
            {errors.thyroid && <p className="text-xs text-destructive">{errors.thyroid.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="thyroidLastCheck">Когда последний раз обследована</Label>
            <Input id="thyroidLastCheck" {...register("thyroidLastCheck")} />
            {errors.thyroidLastCheck && <p className="text-xs text-destructive">{errors.thyroidLastCheck.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lungs">Лёгкие / органы дыхания</Label>
            <Textarea id="lungs" rows={2} {...register("lungs")} />
            {errors.lungs && <p className="text-xs text-destructive">{errors.lungs.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coldFrequency">Частота простуд с кашлем</Label>
            <Input id="coldFrequency" {...register("coldFrequency")} />
            {errors.coldFrequency && <p className="text-xs text-destructive">{errors.coldFrequency.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jointsMuscles">Суставы, мышцы, гибкость, выносливость</Label>
            <Textarea id="jointsMuscles" rows={2} {...register("jointsMuscles")} />
            {errors.jointsMuscles && <p className="text-xs text-destructive">{errors.jointsMuscles.message}</p>}
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
