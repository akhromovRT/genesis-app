export const dynamic = 'force-dynamic';

import Link from "next/link";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/config/site";
import type { Order, OrderStatus } from "@/types/database";

export default async function AdminOrdersPage() {
  const ordersRaw = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const mappedOrders: Order[] = ordersRaw.map((o) => ({
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
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Заказы</h1>
      <p className="mt-1 text-muted-foreground">
        Управление всеми заказами клиентов
      </p>

      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappedOrders.length > 0 ? (
              mappedOrders.map((order) => {
                const statusInfo =
                  ORDER_STATUSES[order.status as OrderStatus];
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusInfo?.color}
                      >
                        {statusInfo?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.total_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Заказов пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
