"use client";

import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold">Корзина пуста</h1>
        <p className="mt-2 text-muted-foreground">
          Добавьте генетические тесты из каталога
        </p>
        <Link href="/catalog" className="mt-8 inline-block">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Корзина</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Очистить
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <Link
                  href={`/catalog/${item.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {item.categoryName}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Price */}
              <div className="w-28 text-right">
                <p className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.price)} / шт.
                  </p>
                )}
              </div>

              {/* Remove */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Итого к оплате</p>
          <p className="text-3xl font-bold">{formatPrice(totalPrice())}</p>
        </div>
        <Link href="/checkout">
          <Button size="lg">
            Оформить заказ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
