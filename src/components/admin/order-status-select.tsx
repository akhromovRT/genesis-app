"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES, type OrderStatus } from "@/config/site";
import { toast } from "sonner";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string | null) {
    if (!newStatus || newStatus === currentStatus) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Ошибка смены статуса");
      } else {
        toast.success(`Статус изменён на «${ORDER_STATUSES[newStatus as OrderStatus]?.label}»`);
        router.refresh();
      }
    } catch {
      toast.error("Ошибка сети");
    }
    setLoading(false);
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ORDER_STATUSES).map(([key, info]) => (
          <SelectItem key={key} value={key}>
            {info.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
