import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

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
            {orders && orders.length > 0 ? (
              (orders as Order[]).map((order) => {
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
