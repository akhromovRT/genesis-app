import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Заказ оформлен",
};

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params.order;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <Card>
        <CardContent className="space-y-6 p-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />

          <div>
            <h1 className="text-2xl font-bold">Заказ оформлен!</h1>
            {orderNumber && (
              <p className="mt-2 text-lg text-muted-foreground">
                Номер заказа: <strong>{orderNumber}</strong>
              </p>
            )}
          </div>

          <p className="text-muted-foreground">
            Мы отправим подтверждение на указанный email. Менеджер свяжется с
            вами для согласования забора биоматериала.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/dashboard/orders">
              <Button>Мои заказы</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="outline">Продолжить покупки</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
