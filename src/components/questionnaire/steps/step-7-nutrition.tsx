"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FrequencyTable } from "../shared/frequency-table";
import {
  PRODUCT_CATEGORIES,
  type Step7Answers,
  type Frequency,
} from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

const PRODUCT_LABELS: Record<string, string> = {
  sweets: "Сладкие продукты",
  flour: "Мучные изделия",
  redMeatSausages: "Красное мясо и колбасы",
  whiteMeat: "Белое мясо",
  organMeats: "Субпродукты",
  fishAny: "Рыба (любая)",
  fishFatty: "Рыба жирных сортов",
  seafood: "Морепродукты",
  dairy: "Молочные продукты",
  fermentedDairy: "Кисломолочные продукты",
  nonStarchyVeg: "Овощи некрахмалистые",
  starchyVeg: "Крахмалистые овощи и корнеплоды",
  fruitsBerries: "Фрукты и ягоды",
  wholeGrains: "Цельнозерновые крупы",
  legumes: "Бобовые",
  animalFats: "Животные жиры",
  plantOilsNutsSeeds: "Растит. масла, орехи, семена",
};

export function Step7Nutrition({ value, onChange, onNext, onBack }: StepProps<Step7Answers>) {
  const [dietType, setDietType] = useState(value?.dietType ?? "");
  const [isVegetarian, setIsVegetarian] = useState(value?.isVegetarian ?? false);
  const [monitorsNutrients, setMonitorsNutrients] = useState(value?.monitorsNutrients ?? false);
  const [productFrequency, setProductFrequency] = useState<Record<string, Frequency>>(
    (value?.productFrequency as Record<string, Frequency>) ?? {}
  );
  const [waterPerDay, setWaterPerDay] = useState(value?.waterPerDay ?? "");
  const [coffeeCups, setCoffeeCups] = useState(value?.coffeeCups ?? "");
  const [caffeineDrinks, setCaffeineDrinks] = useState(value?.caffeineDrinks ?? "");
  const [cocoaHotChocolate, setCocoaHotChocolate] = useState(value?.cocoaHotChocolate ?? "");
  const [herbalTea, setHerbalTea] = useState(value?.herbalTea ?? "");
  const [alcoholFrequency, setAlcoholFrequency] = useState(value?.alcoholFrequency ?? "");
  const [sweetCravings, setSweetCravings] = useState<"none" | "moderate" | "severe">(
    value?.sweetCravings ?? "none"
  );
  const [flourCravings, setFlourCravings] = useState<"none" | "moderate" | "severe">(
    value?.flourCravings ?? "none"
  );
  const [saltySpicyCravings, setSaltySpicyCravings] = useState<"none" | "moderate" | "severe">(
    value?.saltySpicyCravings ?? "none"
  );
  const [nightEating, setNightEating] = useState<"no" | "sometimes" | "often">(
    value?.nightEating ?? "no"
  );
  const [vegetablesPerDay, setVegetablesPerDay] = useState<"<250" | "250-500" | ">500">(
    value?.vegetablesPerDay ?? "250-500"
  );
  const [fruitsPerDay, setFruitsPerDay] = useState<"<150" | "150-350" | ">350">(
    value?.fruitsPerDay ?? "150-350"
  );
  const [greensFrequency, setGreensFrequency] = useState<"daily" | "weekly" | "rarely">(
    value?.greensFrequency ?? "weekly"
  );
  const [cookingOils, setCookingOils] = useState(value?.cookingOils ?? "");

  const productRows = PRODUCT_CATEGORIES.map((k) => ({ key: k, label: PRODUCT_LABELS[k] }));

  const productTableValues = Object.fromEntries(
    Object.entries(productFrequency).map(([k, v]) => [k, { frequency: v }])
  );

  function handleProductChange(key: string, entry: { frequency: Frequency }) {
    setProductFrequency((prev) => ({ ...prev, [key]: entry.frequency }));
  }

  function handleSubmit() {
    onChange({
      dietType,
      isVegetarian,
      monitorsNutrients,
      productFrequency,
      waterPerDay,
      coffeeCups,
      caffeineDrinks,
      cocoaHotChocolate,
      herbalTea,
      alcoholFrequency,
      sweetCravings,
      flourCravings,
      saltySpicyCravings,
      nightEating,
      vegetablesPerDay,
      fruitsPerDay,
      greensFrequency,
      cookingOils,
    });
    onNext();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Питание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dietType">Тип питания / диета</Label>
            <Input
              id="dietType"
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              placeholder="Например: смешанное, кето, средиземноморское"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isVegetarian"
              checked={isVegetarian}
              onCheckedChange={(v) => setIsVegetarian(v === true)}
            />
            <Label htmlFor="isVegetarian" className="text-sm font-normal">
              Вегетарианец / веган / сыроед
            </Label>
          </div>
          {isVegetarian && (
            <div className="flex items-center gap-2 pl-6">
              <Checkbox
                id="monitorsNutrients"
                checked={monitorsNutrients}
                onCheckedChange={(v) => setMonitorsNutrients(v === true)}
              />
              <Label htmlFor="monitorsNutrients" className="text-sm font-normal">
                Контролируете поступление необходимых нутриентов
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Частота продуктов</CardTitle>
          <p className="text-sm text-muted-foreground">
            Отметьте, как часто вы употребляете каждую группу продуктов.
          </p>
        </CardHeader>
        <CardContent>
          <FrequencyTable
            rows={productRows}
            values={productTableValues}
            onChange={handleProductChange}
            showNameField={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Напитки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="waterPerDay">Вода в день (литры)</Label>
              <Input
                id="waterPerDay"
                value={waterPerDay}
                onChange={(e) => setWaterPerDay(e.target.value)}
                placeholder="Например: 1.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coffeeCups">Чашек кофе в день</Label>
              <Input
                id="coffeeCups"
                value={coffeeCups}
                onChange={(e) => setCoffeeCups(e.target.value)}
                placeholder="Например: 2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="caffeineDrinks">Другие кофеиносодержащие напитки</Label>
              <Input
                id="caffeineDrinks"
                value={caffeineDrinks}
                onChange={(e) => setCaffeineDrinks(e.target.value)}
                placeholder="Чай, энергетики и т.д."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cocoaHotChocolate">Какао / горячий шоколад</Label>
              <Input
                id="cocoaHotChocolate"
                value={cocoaHotChocolate}
                onChange={(e) => setCocoaHotChocolate(e.target.value)}
                placeholder="Как часто / сколько"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="herbalTea">Травяные чаи</Label>
              <Input
                id="herbalTea"
                value={herbalTea}
                onChange={(e) => setHerbalTea(e.target.value)}
                placeholder="Какие, как часто"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alcoholFrequency">Алкоголь (частота)</Label>
              <Input
                id="alcoholFrequency"
                value={alcoholFrequency}
                onChange={(e) => setAlcoholFrequency(e.target.value)}
                placeholder="Например: раз в неделю"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Пищевые предпочтения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sweetCravings">Тяга к сладкому</Label>
              <Select value={sweetCravings} onValueChange={(v) => setSweetCravings(v as typeof sweetCravings)}>
                <SelectTrigger id="sweetCravings">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  <SelectItem value="moderate">Умеренная</SelectItem>
                  <SelectItem value="severe">Выраженная</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flourCravings">Тяга к мучному</Label>
              <Select value={flourCravings} onValueChange={(v) => setFlourCravings(v as typeof flourCravings)}>
                <SelectTrigger id="flourCravings">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  <SelectItem value="moderate">Умеренная</SelectItem>
                  <SelectItem value="severe">Выраженная</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="saltySpicyCravings">Тяга к солёному / острому</Label>
              <Select value={saltySpicyCravings} onValueChange={(v) => setSaltySpicyCravings(v as typeof saltySpicyCravings)}>
                <SelectTrigger id="saltySpicyCravings">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  <SelectItem value="moderate">Умеренная</SelectItem>
                  <SelectItem value="severe">Выраженная</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nightEating">Ночные перекусы</Label>
              <Select value={nightEating} onValueChange={(v) => setNightEating(v as typeof nightEating)}>
                <SelectTrigger id="nightEating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Нет</SelectItem>
                  <SelectItem value="sometimes">Иногда</SelectItem>
                  <SelectItem value="often">Часто</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vegetablesPerDay">Овощи в день</Label>
              <Select value={vegetablesPerDay} onValueChange={(v) => setVegetablesPerDay(v as typeof vegetablesPerDay)}>
                <SelectTrigger id="vegetablesPerDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<250">Меньше 250 г</SelectItem>
                  <SelectItem value="250-500">250–500 г</SelectItem>
                  <SelectItem value=">500">Больше 500 г</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fruitsPerDay">Фрукты в день</Label>
              <Select value={fruitsPerDay} onValueChange={(v) => setFruitsPerDay(v as typeof fruitsPerDay)}>
                <SelectTrigger id="fruitsPerDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<150">Меньше 150 г</SelectItem>
                  <SelectItem value="150-350">150–350 г</SelectItem>
                  <SelectItem value=">350">Больше 350 г</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="greensFrequency">Зелень в рационе</Label>
              <Select value={greensFrequency} onValueChange={(v) => setGreensFrequency(v as typeof greensFrequency)}>
                <SelectTrigger id="greensFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ежедневно</SelectItem>
                  <SelectItem value="weekly">Несколько раз в неделю</SelectItem>
                  <SelectItem value="rarely">Редко</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cookingOils">Растительные масла для готовки</Label>
              <Input
                id="cookingOils"
                value={cookingOils}
                onChange={(e) => setCookingOils(e.target.value)}
                placeholder="Подсолнечное, оливковое и т.д."
              />
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
