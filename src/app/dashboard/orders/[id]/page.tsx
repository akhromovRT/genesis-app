import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate, formatDateTime } from "@/lib/format";
import { ORDER_STATUSES } from "@/config/site";
import { ArrowLeft, CheckCircle, Circle, Clock } from "lucide-react";
import type { Order, OrderItem, OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Детали заказа",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "ready",
  "completed",
];

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const typedOrder = order as Order;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const statusInfo = ORDER_STATUSES[typedOrder.status as OrderStatus];
  const currentStatusIndex = STATUS_ORDER.indexOf(
    typedOrder.status as OrderStatus
  );

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Назад к заказам
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Заказ {typedOrder.order_number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            от {formatDate(typedOrder.created_at)}
          </p>
        </div>
        <Badge variant="outline" className={`text-sm ${statusInfo?.color}`}>
          {statusInfo?.label || typedOrder.status}
        </Badge>
      </div>

      {/* Status timeline */}
      {typedOrder.status !== "cancelled" &&
        typedOrder.status !== "refunded" && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {STATUS_ORDER.map((status, index) => {
                  const info = ORDER_STATUSES[status];
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={status} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <CheckCircle
                            className={`h-6 w-6 ${isCurrent ? "text-primary" : "text-green-500"}`}
                          />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground/30" />
                        )}
                        <span
                          className={`mt-2 text-xs ${isCompleted ? "font-medium text-foreground" : "text-muted-foreground/50"}`}
                        >
                          {info.label}
                        </span>
                      </div>
                      {index < STATUS_ORDER.length - 1 && (
                        <div
                          className={`mx-2 h-0.5 flex-1 ${index < currentStatusIndex ? "bg-green-500" : "bg-muted"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Состав заказа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(items as OrderItem[] | null)?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{item.test_name}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-muted-foreground">
                          x{item.quantity}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between font-bold">
                <span>Итого</span>
                <span>{formatPrice(typedOrder.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status history */}
          {history && history.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>История</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((entry) => {
                    const info =
                      ORDER_STATUSES[entry.status as OrderStatus];
                    return (
                      <div key={entry.id} className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {info?.label || entry.status}
                          </p>
                          {entry.comment && (
                            <p className="text-sm text-muted-foreground">
                              {entry.comment}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(entry.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Данные заказчика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Имя</p>
                <p className="font-medium">{typedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{typedOrder.customer_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Телефон</p>
                <p className="font-medium">{typedOrder.customer_phone}</p>
              </div>
              {typedOrder.delivery_address && (
                <div>
                  <p className="text-muted-foreground">Адрес</p>
                  <p className="font-medium">{typedOrder.delivery_address}</p>
                </div>
              )}
              {typedOrder.notes && (
                <div>
                  <p className="text-muted-foreground">Комментарий</p>
                  <p className="font-medium">{typedOrder.notes}</p>
                </div>
              )}
              {typedOrder.paid_at && (
                <div>
                  <p className="text-muted-foreground">Оплачен</p>
                  <p className="font-medium">
                    {formatDateTime(typedOrder.paid_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
