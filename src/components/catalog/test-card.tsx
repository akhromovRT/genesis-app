import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, pluralize } from "@/lib/format";
import { Clock, Dna } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import type { TestWithCategory } from "@/types/database";

interface TestCardProps {
  test: TestWithCategory;
}

export function TestCard({ test }: TestCardProps) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/catalog/${test.slug}`}
            className="text-base font-semibold leading-tight hover:text-primary"
          >
            {test.name}
          </Link>
          {test.is_popular && (
            <Badge variant="secondary" className="shrink-0">
              Популярное
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="w-fit text-xs">
          {test.categories.name}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {test.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {test.markers_count && (
            <span className="flex items-center gap-1">
              <Dna className="h-3.5 w-3.5" />
              {pluralize(test.markers_count, "маркер", "маркера", "маркеров")}
            </span>
          )}
          {test.turnaround_days && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {pluralize(test.turnaround_days, "день", "дня", "дней")}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <span className="text-lg font-bold">{formatPrice(test.price)}</span>
        <AddToCartButton
          size="sm"
          test={{
            id: test.id,
            name: test.name,
            slug: test.slug,
            price: test.price,
            categoryName: test.categories.name,
            markersCount: test.markers_count,
          }}
        />
      </CardFooter>
    </Card>
  );
}
