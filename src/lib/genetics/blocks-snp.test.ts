// СЧЁТ SNP — источник истины:
// 184 уникальных gene:rs — честный счёт (дедупликация по всем блокам).
// Галинины 225/146 — счёт «по контекстам анализа»: один SNP считается
// в нескольких лекарственных/клинических контекстах + пересечения блоков.
// Заголовок «225 SNP» на витрине финализируется после уточнения у Галины.

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
