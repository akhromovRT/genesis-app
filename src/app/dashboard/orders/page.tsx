import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/config/site";
import { Package, ArrowRight } from "lucide-react";
import type { Order, OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Мои заказы",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Мои заказы</h1>
      <p className="mt-1 text-muted-foreground">
        История ваших заказов генетических тестов
      </p>

      {orders && orders.length > 0 ? (
        <div className="mt-8 space-y-4">
          {(orders as Order[]).map((order) => {
            const statusInfo = ORDER_STATUSES[order.status as OrderStatus];
            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">{order.order_number}</p>
                        <Badge
                          variant="outline"
                          className={statusInfo?.color}
                        >
                          {statusInfo?.label || order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Заказов пока нет</p>
          <p className="mt-1 text-muted-foreground">
            Выберите генетический тест в каталоге
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-block text-primary hover:underline"
          >
            Перейти в каталог
          </Link>
        </div>
      )}
    </div>
  );
}
