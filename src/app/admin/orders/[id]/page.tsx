import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { orders, orderItems, testResults, orderStatusHistory } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate, formatDateTime } from "@/lib/format";
import { ORDER_STATUSES } from "@/config/site";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { ResultUploadForm } from "@/components/admin/result-upload-form";
import { ArrowLeft, FileText } from "lucide-react";
import type { Order, OrderItem, OrderStatus, TestResult } from "@/types/database";

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;

  const [orderRaw] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!orderRaw) notFound();

  const o: Order = {
    id: orderRaw.id,
    order_number: orderRaw.orderNumber,
    user_id: orderRaw.userId ?? null,
    status: orderRaw.status as OrderStatus,
    total_amount: orderRaw.totalAmount,
    customer_name: orderRaw.customerName,
    customer_email: orderRaw.customerEmail,
    customer_phone: orderRaw.customerPhone,
    delivery_address: orderRaw.deliveryAddress ?? "",
    notes: orderRaw.notes ?? "",
    payment_id: orderRaw.paymentId ?? null,
    payment_status: orderRaw.paymentStatus ?? null,
    paid_at: orderRaw.paidAt?.toISOString() ?? null,
    created_at: orderRaw.createdAt?.toISOString() ?? "",
    updated_at: orderRaw.updatedAt?.toISOString() ?? "",
  };

  const itemsRaw = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const items: OrderItem[] = itemsRaw.map((i) => ({
    id: i.id,
    order_id: i.orderId,
    test_id: i.testId,
    test_name: i.testName,
    price: i.price,
    quantity: i.quantity,
    created_at: i.createdAt?.toISOString() ?? "",
  }));

  const resultsRaw = await db
    .select()
    .from(testResults)
    .where(eq(testResults.orderId, id))
    .orderBy(desc(testResults.createdAt));

  const results: TestResult[] = resultsRaw.map((r) => ({
    id: r.id,
    order_id: r.orderId,
    order_item_id: r.orderItemId ?? null,
    user_id: r.userId,
    file_url: r.fileUrl,
    file_name: r.fileName,
    file_size: r.fileSize ?? null,
    description: r.description ?? "",
    uploaded_by: r.uploadedBy ?? null,
    created_at: r.createdAt?.toISOString() ?? "",
  }));

  const historyRaw = await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, id))
    .orderBy(asc(orderStatusHistory.createdAt));

  const history = historyRaw.map((h) => ({
    id: h.id,
    status: h.status,
    comment: h.comment ?? "",
    created_at: h.createdAt?.toISOString() ?? "",
  }));

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Все заказы
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Заказ {o.order_number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            от {formatDate(o.created_at)}
          </p>
        </div>
        <OrderStatusSelect
          orderId={o.id}
          currentStatus={o.status as OrderStatus}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Состав заказа</CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
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
              <Separator className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Итого</span>
                <span>{formatPrice(o.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Upload results */}
          <Card>
            <CardHeader>
              <CardTitle>Загрузить результат</CardTitle>
            </CardHeader>
            <CardContent>
              {o.user_id ? (
                <ResultUploadForm orderId={o.id} userId={o.user_id} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Гостевой заказ — нет привязанного пользователя. Результат
                  можно загрузить после привязки.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Uploaded results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Загруженные результаты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {r.file_name}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(r.created_at)}
                        {r.description && ` — ${r.description}`}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История статусов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="text-sm">
                    <span className="font-medium">
                      {ORDER_STATUSES[h.status as OrderStatus]?.label ||
                        h.status}
                    </span>
                    {h.comment && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {h.comment}
                      </span>
                    )}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDateTime(h.created_at)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: customer */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Клиент</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Имя</p>
                <p className="font-medium">{o.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{o.customer_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Телефон</p>
                <p className="font-medium">{o.customer_phone}</p>
              </div>
              {o.delivery_address && (
                <div>
                  <p className="text-muted-foreground">Адрес</p>
                  <p className="font-medium">{o.delivery_address}</p>
                </div>
              )}
              {o.notes && (
                <div>
                  <p className="text-muted-foreground">Комментарий</p>
                  <p className="font-medium">{o.notes}</p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-muted-foreground">Payment ID</p>
                <p className="font-mono text-xs">{o.payment_id || "—"}</p>
              </div>
              {o.user_id && (
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs">{o.user_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
