"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  function handleClick(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!activeCategory ? "default" : "outline"}
        className={cn("cursor-pointer transition-colors", !activeCategory && "bg-primary text-primary-foreground")}
        onClick={() => handleClick(null)}
      >
        Все тесты
      </Badge>
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={activeCategory === cat.slug ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-colors",
            activeCategory === cat.slug && "bg-primary text-primary-foreground"
          )}
          onClick={() => handleClick(cat.slug)}
        >
          {cat.name}
        </Badge>
      ))}
    </div>
  );
}
