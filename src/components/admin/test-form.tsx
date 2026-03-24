"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Category, Test } from "@/types/database";

interface TestFormProps {
  categories: Category[];
  initialData?: Test;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-а-яё]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
        ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
        я: "ya",
      };
      return map[char] || char;
    });
}

export function TestForm({ categories, initialData }: TestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    code: initialData?.code || "",
    categoryId: initialData?.category_id || "",
    price: initialData ? String(initialData.price / 100) : "",
    description: initialData?.description || "",
    fullDescription: initialData?.full_description || "",
    markersCount: initialData?.markers_count?.toString() || "",
    turnaroundDays: initialData?.turnaround_days?.toString() || "",
    biomaterial: initialData?.biomaterial || "Буккальный эпителий / кровь",
    isActive: initialData?.is_active ?? true,
    isPopular: initialData?.is_popular ?? false,
  });

  function updateField(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "name" && !isEditing) {
      setForm((f) => ({ ...f, slug: slugify(value as string) }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      code: form.code,
      category_id: form.categoryId,
      price: Math.round(parseFloat(form.price) * 100), // rubles to kopecks
      description: form.description,
      full_description: form.fullDescription,
      markers_count: form.markersCount ? parseInt(form.markersCount) : null,
      turnaround_days: form.turnaroundDays
        ? parseInt(form.turnaroundDays)
        : null,
      biomaterial: form.biomaterial,
      is_active: form.isActive,
      is_popular: form.isPopular,
    };

    try {
      const url = isEditing
        ? `/api/admin/catalog?id=${initialData.id}`
        : "/api/admin/catalog";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Ошибка сохранения");
      } else {
        toast.success(isEditing ? "Тест обновлён" : "Тест создан");
        router.push("/admin/catalog");
        router.refresh();
      }
    } catch {
      toast.error("Ошибка сети");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Название *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL) *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Категория *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => v && updateField("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Код CERBALAB</Label>
                <Input
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Цена (руб.) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Краткое описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Полное описание</Label>
              <Textarea
                value={form.fullDescription}
                onChange={(e) =>
                  updateField("fullDescription", e.target.value)
                }
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Параметры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Кол-во маркеров</Label>
                <Input
                  type="number"
                  value={form.markersCount}
                  onChange={(e) => updateField("markersCount", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Срок (раб. дней)</Label>
                <Input
                  type="number"
                  value={form.turnaroundDays}
                  onChange={(e) =>
                    updateField("turnaroundDays", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Биоматериал</Label>
                <Input
                  value={form.biomaterial}
                  onChange={(e) => updateField("biomaterial", e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                />
                Активен (виден в каталоге)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => updateField("isPopular", e.target.checked)}
                />
                Популярный
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Сохранить изменения" : "Создать тест"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Отмена
          </Button>
        </div>
      </div>
    </form>
  );
}
