// СЧЁТ SNP — источник истины (РЕШЕНО 2026-05-31, перечитыванием первоисточника):
// 184 уникальных gene:rs — честный счёт (дедупликация по всем блокам). Это инженерная
// реальность: модуль физически содержит 184 уникальных пары.
// Галинины 225/146 — авторская декомпозиция «аналитических ген-точек по контекстам»:
// блоки 1–4 у неё сходятся ТОЧНО как уникальные (51/28/27/12 == честный счёт), а в
// фармакогенетике блока 5 один SNP читается ради нескольких лекарственных решений и
// считается несколько раз (122 записи в колонках → 103 уникальных; +18 «усилителей»
// из блоков 1–4 → её 146). Это не ошибка и не требует докомплекта SNP.
// Маркетинговое «225 SNP» и markers_count БД — продуктовые числа Галины; этот модуль —
// уникальные 184. Подробнее: ADR-003.

import { describe, it, expect } from "vitest";
import { BLOCKS_SNP, allUniqueSnps, blockSnpCount } from "./blocks-snp";

const key = (s: { gene: string; rs: string }) => `${s.gene}:${s.rs}`;

describe("blocks-snp source of truth", () => {
  it("содержит ровно 5 блоков с нужными slug", () => {
    expect(BLOCKS_SNP.map((b) => b.slug)).toEqual([
      "nutrition", "body", "beauty-safety", "mind", "risks",
    ]);
  });
  it("число уникальных gene:rs по всем блокам = 184", () => {
    expect(allUniqueSnps().length).toBe(184);
  });
  it("в каждом блоке нет дублей gene:rs", () => {
    for (const b of BLOCKS_SNP) {
      const keys = b.snps.map(key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
  it("заявленные размеры блоков совпадают", () => {
    expect(blockSnpCount("nutrition")).toBe(51);
    expect(blockSnpCount("body")).toBe(28);
    expect(blockSnpCount("beauty-safety")).toBe(27);
    expect(blockSnpCount("mind")).toBe(12);
    expect(blockSnpCount("risks")).toBe(103);
  });
});
