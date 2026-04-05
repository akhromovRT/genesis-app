"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function UploadForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/dna/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      toast.error(data.error || "Ошибка загрузки");
      return;
    }

    toast.success(`Отчёт загружен: ${data.markersCount} маркеров`);
    router.refresh();
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        size="lg"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Обрабатываем PDF...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Загрузить отчёт CERBALAB
          </>
        )}
      </Button>
    </>
  );
}
