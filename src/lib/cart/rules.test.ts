import { describe, it, expect } from "vitest";
import { canAddBlock, applyGiftRule, type RuleItem } from "./rules";

const item = (slug: string, extra: Partial<RuleItem> = {}): RuleItem => ({
  id: slug, slug, productType: "block", price: 1590000, isGift: false, ...extra,
});

describe("гейтинг воронки", () => {
  it("nutrition можно добавить всегда", () => {
    expect(canAddBlock("nutrition", [], []).ok).toBe(true);
  });
  it("body нельзя без nutrition в корзине и без покупки", () => {
    const res = canAddBlock("body", [], []);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("nutrition-required");
  });
  it("body можно, если nutrition в корзине", () => {
    expect(canAddBlock("body", [item("nutrition")], []).ok).toBe(true);
  });
  it("body можно, если nutrition куплен ранее", () => {
    expect(canAddBlock("body", [], ["nutrition"]).ok).toBe(true);
  });
  it("risks можно без nutrition (самостоятельный блок)", () => {
    expect(canAddBlock("risks", [], []).ok).toBe(true);
  });
});

describe("подарок Блок 4 (mind)", () => {
  it("при 2 платных блоках добавляет mind как подарок 0 ₽", () => {
    const out = applyGiftRule([item("nutrition"), item("body")]);
    const gift = out.find((i) => i.slug === "mind");
    expect(gift).toBeDefined();
    expect(gift!.isGift).toBe(true);
    expect(gift!.price).toBe(0);
  });
  it("при 1 блоке подарка нет", () => {
    expect(applyGiftRule([item("nutrition")]).some((i) => i.slug === "mind")).toBe(false);
  });
  it("снимает подарок, если блоков стало меньше 2", () => {
    const withGift = applyGiftRule([item("nutrition"), item("body")]);
    const reduced = applyGiftRule(withGift.filter((i) => i.slug === "nutrition" || i.isGift));
    expect(reduced.some((i) => i.slug === "mind")).toBe(false);
  });
  it("не добавляет подарок, если в корзине есть пакет", () => {
    const out = applyGiftRule([item("full-package", { productType: "package" }), item("nutrition")]);
    expect(out.some((i) => i.slug === "mind" && i.isGift)).toBe(false);
  });
  it("не дублирует платно купленный mind", () => {
    const out = applyGiftRule([item("nutrition"), item("body"), item("mind", { price: 1490000 })]);
    expect(out.filter((i) => i.slug === "mind").length).toBe(1);
    expect(out.find((i) => i.slug === "mind")!.isGift).toBe(false);
  });
});
