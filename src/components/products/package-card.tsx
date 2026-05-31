import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Gift, MessageSquare, ArrowRight } from "lucide-react";
import {
  formatPrice,
  calculateSavings,
  calculateSavingsPercent,
  type ProductPackage,
  type ProductBlock,
} from "@/lib/products/blocks";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

interface PackageCardProps {
  pkg: ProductPackage;
  blocksBySlug: Map<string, ProductBlock>;
  emphasis?: boolean;
  ctaHref?: string;
}

export function PackageCard({ pkg, blocksBySlug, emphasis = false, ctaHref }: PackageCardProps) {
  const savings = calculateSavings(pkg.price, pkg.compareAtPrice);
  const savingsPercent = calculateSavingsPercent(pkg.price, pkg.compareAtPrice);
  const includedBlocks = pkg.includedBlockSlugs
    .map((slug) => blocksBySlug.get(slug))
    .filter((b): b is ProductBlock => Boolean(b));
  const giftBlock = pkg.giftBlockSlug ? blocksBySlug.get(pkg.giftBlockSlug) : null;

  return (
    <Card
      className={[
        "flex h-full flex-col transition-shadow hover:shadow-md",
        emphasis ? "border-primary shadow-lg ring-1 ring-primary/30" : "",
      ].join(" ")}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">{pkg.name}</h3>
          {emphasis && (
            <Badge variant="default" className="shrink-0">
              Лучшая цена
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{formatPrice(pkg.price)}</span>
          {pkg.compareAtPrice && savings > 0 && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(pkg.compareAtPrice)}
              </span>
              <Badge variant="secondary" className="text-xs">
                −{savingsPercent}%
              </Badge>
            </>
          )}
        </div>
        {savings > 0 && (
          <p className="text-sm font-medium text-primary">
            Экономия {formatPrice(savings)}
          </p>
        )}

        <div className="space-y-2 text-sm">
          {includedBlocks.map((b) => (
            <div key={b.slug} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{b.name}</span>
            </div>
          ))}
          {giftBlock && (
            <div className="flex items-start gap-2">
              <Gift className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium">Блок 4 «Мозг, сон, стресс»</span>{" "}
                <span className="text-muted-foreground">— в подарок при покупке любых двух блоков</span>
              </span>
            </div>
          )}
          {pkg.consultationHours > 0 && (
            <div className="flex items-start gap-2">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {pkg.consultationHours} ч персональной консультации
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t pt-4">
        <AddToCartButton
          size="lg"
          className="w-full"
          test={{
            id: pkg.id,
            name: pkg.name,
            slug: pkg.slug,
            price: pkg.price,
            categoryName: "Красивое долголетие",
            markersCount: null,
            productType: "package",
          }}
        />
        {ctaHref && (
          <Link href={ctaHref} className="w-full">
            <Button variant="ghost" size="sm" className="w-full">
              Что внутри
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
