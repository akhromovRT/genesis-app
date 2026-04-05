"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Удалить этот отчёт? Действие необратимо.")) return;
    setLoading(true);
    const res = await fetch(`/api/dna/reports/${reportId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      toast.success("Отчёт удалён");
      router.refresh();
    } else {
      toast.error("Ошибка удаления");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
