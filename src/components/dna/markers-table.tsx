"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

interface Marker {
  position: number;
  gene: string;
  rsid: string;
  genotype: string;
}

export function MarkersTable({ markers }: { markers: Marker[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return markers;
    return markers.filter(
      (m) =>
        m.gene.toLowerCase().includes(q) ||
        m.rsid.toLowerCase().includes(q) ||
        m.genotype.toLowerCase().includes(q)
    );
  }, [markers, query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по гену, rs или генотипу..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        Найдено: {filtered.length} из {markers.length}
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Ген</TableHead>
              <TableHead>rs</TableHead>
              <TableHead>Генотип</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={`${m.position}-${m.gene}-${m.rsid}`}>
                <TableCell className="text-muted-foreground">{m.position}</TableCell>
                <TableCell className="font-medium">{m.gene}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{m.rsid || "—"}</TableCell>
                <TableCell className="font-mono font-semibold">{m.genotype}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
