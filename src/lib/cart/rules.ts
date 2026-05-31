export interface RuleItem {
  id: string;
  slug: string;
  productType: "block" | "package" | "test";
  price: number; // kopecks
  isGift: boolean;
}

const GATED_BLOCKS = new Set(["body", "beauty-safety", "mind"]);
const GIFT_ELIGIBLE = new Set(["nutrition", "body", "beauty-safety", "risks"]);
const GIFT_SLUG = "mind";

export type AddResult = { ok: true } | { ok: false; reason: "nutrition-required" };

/** Можно ли добавить блок с учётом гейтинга воронки. */
export function canAddBlock(
  slug: string,
  cart: RuleItem[],
  purchasedSlugs: string[],
): AddResult {
  if (!GATED_BLOCKS.has(slug)) return { ok: true };
  const hasNutrition =
    cart.some((i) => i.slug === "nutrition") || purchasedSlugs.includes("nutrition");
  return hasNutrition ? { ok: true } : { ok: false, reason: "nutrition-required" };
}

/** Привести корзину к согласованному состоянию подарка Блок 4. */
export function applyGiftRule(cart: RuleItem[]): RuleItem[] {
  const withoutGift = cart.filter((i) => !(i.slug === GIFT_SLUG && i.isGift));
  const hasPackage = withoutGift.some((i) => i.productType === "package");
  const paidMind = withoutGift.some((i) => i.slug === GIFT_SLUG && !i.isGift);
  const eligibleBlocks = withoutGift.filter(
    (i) => i.productType === "block" && GIFT_ELIGIBLE.has(i.slug),
  ).length;

  if (!hasPackage && !paidMind && eligibleBlocks >= 2) {
    return [
      ...withoutGift,
      { id: "gift-mind", slug: GIFT_SLUG, productType: "block", price: 0, isGift: true },
    ];
  }
  return withoutGift;
}
