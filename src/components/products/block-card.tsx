import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dna, ArrowRight, Sparkles } from "lucide-react";
import { formatPrice, type ProductBlock } from "@/lib/products/blocks";
import { pluralize } from "@/lib/format";

interface BlockCardProps {
  block: ProductBlock;
  highlight?: "entry" | "bestseller" | null;
}

export function BlockCard({ block, highlight = null }: BlockCardProps) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${block.slug}`}
            className="text-base font-semibold leading-tight hover:text-primary"
          >
            {block.name}
          </Link>
          {highlight === "entry" && (
            <Badge variant="secondary" className="shrink-0">
              База
            </Badge>
          )}
          {highlight === "bestseller" && (
            <Badge variant="default" className="shrink-0">
              <Sparkles className="mr-1 h-3 w-3" />
              Хит
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {block.painHeadline || block.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {block.markersCount && (
            <span className="flex items-center gap-1">
              <Dna className="h-3.5 w-3.5" />
              {pluralize(block.markersCount, "ген-точка", "ген-точки", "ген-точек")}
            </span>
          )}
          {block.consultationHours > 0 && (
            <span className="flex items-center gap-1">
              + {block.consultationHours} ч консультации
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <span className="text-lg font-bold">{formatPrice(block.price)}</span>
        <Link href={`/products/${block.slug}`}>
          <Button size="sm" variant="outline">
            Подробнее
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
