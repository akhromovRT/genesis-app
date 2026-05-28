import { describe, it, expect } from "vitest";
import { calculateSavings, calculateSavingsPercent, calculateAnchorPrice, type ProductBlock } from "./blocks";

// Цены в копейках, как в БД (formatPrice делит на 100 для отображения).

describe("calculateSavings", () => {
  it("returns 0 when no compareAtPrice", () => {
    expect(calculateSavings(6500000, null)).toBe(0);
  });
  it("returns positive savings amount in kopecks", () => {
    // полный пакет 65 000 ₽ vs якорь 89 900 ₽ = 24 900 ₽
    expect(calculateSavings(6500000, 8990000)).toBe(2490000);
  });
  it("returns 0 when compareAtPrice is less than or equal to price", () => {
    expect(calculateSavings(8990000, 6500000)).toBe(0);
    expect(calculateSavings(6500000, 6500000)).toBe(0);
  });
});

describe("calculateSavingsPercent", () => {
  it("returns 0 when no savings", () => {
    expect(calculateSavingsPercent(6500000, null)).toBe(0);
    expect(calculateSavingsPercent(8990000, 6500000)).toBe(0);
  });
  it("returns rounded percent of savings", () => {
    // 24 900 / 89 900 = 0.277 → 28
    expect(calculateSavingsPercent(6500000, 8990000)).toBe(28);
    // 14 900 / 89 900 = 0.166 → 17
    expect(calculateSavingsPercent(7500000, 8990000)).toBe(17);
    // 4 800 / 47 700 = 0.1006 → 10
    expect(calculateSavingsPercent(4290000, 4770000)).toBe(10);
  });
});

describe("calculateAnchorPrice", () => {
  it("sums prices of all blocks (returns 0 for empty)", () => {
    expect(calculateAnchorPrice([])).toBe(0);
  });
  it("returns the correct anchor for the 5 Krasivoe Dolgoletie blocks", () => {
    const blocks = [
      { price: 1590000 }, // nutrition
      { price: 1590000 }, // body
      { price: 1590000 }, // beauty-safety
      { price: 1490000 }, // mind
      { price: 2730000 }, // risks
    ] as ProductBlock[];
    // 89 900 ₽ = 8 990 000 копеек
    expect(calculateAnchorPrice(blocks)).toBe(8990000);
  });
});
