"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { PhenoAgeResult, MarkerStatus } from "@/lib/phenoage";

function StatusDot({ status }: { status: MarkerStatus }) {
  const colors = {
    good: "bg-green-500",
    borderline: "bg-yellow-500",
    bad: "bg-red-500",
  };
  const labels = {
    good: "В норме",
    borderline: "Пограничный",
    bad: "Вне нормы",
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]}`} />
      <span className="text-xs text-muted-foreground">{labels[status]}</span>
    </span>
  );
}

function AgeScale({ chronological, biological }: { chronological: number; biological: number }) {
  const min = 20;
  const max = 100;
  const range = max - min;
  const chronoPos = Math.max(0, Math.min(100, ((chronological - min) / range) * 100));
  const bioPos = Math.max(0, Math.min(100, ((biological - min) / range) * 100));

  return (
    <div className="mt-6 px-2">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-green-200 via-yellow-200 to-red-200">
        {/* Chronological age marker */}
        <div
          className="absolute -top-1 flex flex-col items-center"
          style={{ left: `${chronoPos}%`, transform: "translateX(-50%)" }}
        >
          <div className="h-5 w-0.5 bg-muted-foreground/60" />
          <span className="mt-1 text-[10px] font-medium text-muted-foreground">
            {chronological} паспорт
          </span>
        </div>
        {/* Biological age marker */}
        <div
          className="absolute -top-2 flex flex-col items-center"
          style={{ left: `${bioPos}%`, transform: "translateX(-50%)" }}
        >
          <div className="h-7 w-1 rounded-full bg-primary" />
          <span className="mt-1 text-[10px] font-bold text-primary">
            {biological} био
          </span>
        </div>
      </div>
      <div className="mt-6 flex justify-between text-[10px] text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function CalculatorResult({ result }: { result: PhenoAgeResult }) {
  const [showDetails, setShowDetails] = useState(false);
  const isYounger = result.difference < 0;
  const absDiff = Math.abs(result.difference);
  const problemMarkers = result.markers.filter((m) => m.status !== "good");

  return (
    <div className="space-y-6">
      {/* Main result */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Ваш биологический возраст</p>
          <p className="mt-2 text-6xl font-bold tracking-tight">
            {result.phenoAge}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">лет по PhenoAge</p>
          <div className={`mt-4 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium ${
            isYounger
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {isYounger ? "−" : "+"}{absDiff} {absDiff === 1 ? "год" : absDiff < 5 ? "года" : "лет"} от паспортного возраста ({result.chronologicalAge})
          </div>
          <AgeScale chronological={result.chronologicalAge} biological={result.phenoAge} />
        </CardContent>
      </Card>

      {/* Marker assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Оценка маркеров</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Маркер</TableHead>
                <TableHead className="text-right">Значение</TableHead>
                <TableHead className="text-right">Оптимум</TableHead>
                <TableHead className="text-center">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.markers.map((m) => (
                <TableRow key={m.info.key}>
                  <TableCell className="font-medium">{m.info.nameRu}</TableCell>
                  <TableCell className="text-right">
                    {m.value} {m.info.unit}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {m.info.optimalMin}–{m.info.optimalMax}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusDot status={m.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recommendations for problem markers */}
      {problemMarkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Рекомендации</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {problemMarkers.map((m) => (
              <div key={m.info.key} className="flex gap-3">
                <StatusDot status={m.status} />
                <div>
                  <p className="text-sm font-medium">{m.info.nameRu}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                    {m.info.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Details for nerds */}
      <Card>
        <CardContent className="p-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Details for nerds — формула и расчёты
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showDetails && (
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p><strong>Формула:</strong> Levine et al. "An epigenetic biomarker of aging for lifespan and healthspan" (Aging, 2018)</p>
              <div className="rounded-lg bg-muted p-3 font-mono text-xs">
                <p>xb = -19.9067 - 0.0336×Albumin + 0.0095×Creatinine + 0.1953×Glucose + 0.0954×ln(CRP) - 0.0120×Lymphocyte% + 0.0268×MCV + 0.3306×RDW + 0.00188×ALP + 0.0554×WBC + 0.0804×Age</p>
                <p className="mt-2">M = 1 - exp(-1.51714 × exp(xb) / 0.0076927)</p>
                <p>PhenoAge = 141.50225 + ln(-0.00553 × ln(1 - M)) / 0.090165</p>
              </div>
              <p><strong>Промежуточные значения:</strong></p>
              <p>xb = {result.xb} | M = {result.mortality}</p>
              <a
                href="https://doi.org/10.18632/aging.101414"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Читать оригинальную статью <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold">
            Хотите понять <em>почему</em> ваши маркеры такие?
          </h3>
          <p className="mt-2 text-muted-foreground">
            Генетический тест покажет предрасположенности и поможет составить персональный план оптимизации здоровья.
          </p>
          <Link href="/catalog" className="mt-6 inline-block">
            <Button size="lg">
              Выбрать генетический тест
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
