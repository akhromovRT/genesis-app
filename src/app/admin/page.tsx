export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { orders, profiles } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { Package, CreditCard, Clock, CheckCircle } from "lucide-react";

export default async function AdminDashboard() {
  const [{ value: totalOrders }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(orders);

  const [{ value: paidOrders }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "paid"));

  const [{ value: processingOrders }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "processing"));

  const [{ value: completedOrders }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "completed"));

  const [{ value: totalRevenue }] = await db
    .select({ value: sql<number>`coalesce(sum(total_amount), 0)::int` })
    .from(orders)
    .where(inArray(orders.status, ["paid", "processing", "ready", "completed"]));

  const [{ value: totalUsers }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(profiles)
    .where(eq(profiles.role, "user"));

  const stats = [
    {
      title: "Всего заказов",
      value: totalOrders || 0,
      icon: Package,
    },
    {
      title: "Выручка",
      value: formatPrice(totalRevenue || 0),
      icon: CreditCard,
    },
    {
      title: "Оплачено / В работе",
      value: `${paidOrders || 0} / ${processingOrders || 0}`,
      icon: Clock,
    },
    {
      title: "Завершено",
      value: completedOrders || 0,
      icon: CheckCircle,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
      <p className="mt-1 text-muted-foreground">
        Обзор заказов и пользователей. Всего пользователей: {totalUsers || 0}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
