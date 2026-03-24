"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { Loader2, CreditCard, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    notes: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            testId: item.id,
            testName: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка при оформлении заказа");
        setLoading(false);
        return;
      }

      // Success — clear cart and redirect
      clearCart();
      router.push(`/checkout/success?order=${data.orderNumber}`);
    } catch {
      toast.error("Ошибка сети. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold">Корзина пуста</h1>
        <p className="mt-2 text-muted-foreground">
          Добавьте тесты в корзину для оформления заказа
        </p>
        <Link href="/catalog" className="mt-8 inline-block">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Оформление заказа
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Контактные данные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя и фамилия *</Label>
                  <Input
                    id="name"
                    value={form.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    placeholder="Иван Иванов"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) =>
                        updateField("customerEmail", e.target.value)
                      }
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) =>
                        updateField("customerPhone", e.target.value)
                      }
                      placeholder="+7 (999) 123-45-67"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Адрес лаборатории / забор на дому
                  </Label>
                  <Input
                    id="address"
                    value={form.deliveryAddress}
                    onChange={(e) =>
                      updateField("deliveryAddress", e.target.value)
                    }
                    placeholder="Город, адрес"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Комментарий к заказу</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Особые пожелания..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-muted-foreground">
                          x{item.quantity}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between font-bold">
                  <span>Итого</span>
                  <span className="text-xl">{formatPrice(totalPrice())}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Оформляем...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Оплатить {formatPrice(totalPrice())}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь с условиями оферты
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
