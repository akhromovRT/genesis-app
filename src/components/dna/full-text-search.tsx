"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function FullTextSearch({ text }: { text: string }) {
  const [query, setQuery] = useState("");

  const highlighted = useMemo(() => {
    if (!query.trim()) return text;
    const q = query.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "«§«$1»§»");
  }, [text, query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск в тексте отчёта..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="max-h-[600px] overflow-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed">
        {highlighted.split(/(«§«[^»]+»§»)/).map((part, i) => {
          if (part.startsWith("«§«") && part.endsWith("»§»")) {
            return (
              <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
                {part.slice(3, -3)}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
}
