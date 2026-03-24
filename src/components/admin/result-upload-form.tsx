"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface ResultUploadFormProps {
  orderId: string;
  userId: string;
}

export function ResultUploadForm({ orderId, userId }: ResultUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Выберите файл");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("orderId", orderId);
    formData.append("userId", userId);
    formData.append("description", description);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/results`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Ошибка загрузки");
      } else {
        toast.success("Результат загружен");
        setFile(null);
        setDescription("");
        router.refresh();
      }
    } catch {
      toast.error("Ошибка сети");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">PDF-файл результата</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">Комментарий</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание результата..."
          rows={2}
        />
      </div>
      <Button type="submit" disabled={loading || !file}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Загрузить результат
      </Button>
    </form>
  );
}
