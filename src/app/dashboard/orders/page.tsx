export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/config/site";
import { Package, ArrowRight } from "lucide-react";
import type { Order, OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Мои заказы",
};

function mapOrder(o: typeof orders.$inferSelect): Order {
  return {
    id: o.id,
    order_number: o.orderNumber,
    user_id: o.userId ?? null,
    status: o.status as OrderStatus,
    total_amount: o.totalAmount,
    customer_name: o.customerName,
    customer_email: o.customerEmail,
    customer_phone: o.customerPhone,
    delivery_address: o.deliveryAddress ?? "",
    notes: o.notes ?? "",
    payment_id: o.paymentId ?? null,
    payment_status: o.paymentStatus ?? null,
    paid_at: o.paidAt?.toISOString() ?? null,
    created_at: o.createdAt?.toISOString() ?? "",
    updated_at: o.updatedAt?.toISOString() ?? "",
  };
}

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/dashboard/orders");

  const userOrdersRaw = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  const userOrders: Order[] = userOrdersRaw.map(mapOrder);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Мои заказы</h1>
      <p className="mt-1 text-muted-foreground">
        История ваших заказов генетических тестов
      </p>

      {userOrders.length > 0 ? (
        <div className="mt-8 space-y-4">
          {userOrders.map((order) => {
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
