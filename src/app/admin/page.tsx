import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { Package, CreditCard, Clock, CheckCircle } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: paidOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  const { count: processingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "processing");

  const { count: completedOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .in("status", ["paid", "processing", "ready", "completed"]);

  const totalRevenue = revenueData?.reduce(
    (sum, o) => sum + (o.total_amount || 0),
    0
  ) || 0;

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  const stats = [
    {
      title: "Всего заказов",
      value: totalOrders || 0,
      icon: Package,
    },
    {
      title: "Выручка",
      value: formatPrice(totalRevenue),
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
