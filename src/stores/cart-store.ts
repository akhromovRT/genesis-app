import { create } from "zustand";
import { persist } from "zustand/middleware";
import { canAddBlock, applyGiftRule, type RuleItem, type AddResult } from "@/lib/cart/rules";

export interface CartItem {
  id: string; // test.id
  name: string;
  slug: string;
  price: number; // kopecks
  quantity: number;
  categoryName: string;
  markersCount: number | null;
  productType: "block" | "package" | "test";
  isGift?: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => AddResult;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

/** Map CartItems to RuleItems for rules engine. */
function toRuleItems(items: CartItem[]): RuleItem[] {
  return items.map((i) => ({
    id: i.id,
    slug: i.slug,
    productType: i.productType,
    price: i.price,
    isGift: i.isGift ?? false, // ?? covers persisted/hydrated carts that predate the field
  }));
}

const GIFT_CART_ITEM: Omit<CartItem, "quantity"> = {
  id: "gift-mind",
  slug: "mind",
  name: "Мозг, сон, стресс и мотивация — в подарок",
  price: 0,
  categoryName: "Подарок",
  markersCount: 12,
  productType: "block",
  isGift: true,
};

/** Recompute gift row: strip existing gift, then append if rules say so. */
function recomputeGift(items: CartItem[]): CartItem[] {
  const withoutGift = items.filter((i) => !i.isGift);
  const ruleItems = toRuleItems(withoutGift);
  const afterRule = applyGiftRule(ruleItems);
  const giftRuleItem = afterRule.find((r) => r.id === "gift-mind");
  if (giftRuleItem) {
    return [...withoutGift, { ...GIFT_CART_ITEM, quantity: 1 }];
  }
  return withoutGift;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const currentItems = get().items;

        // Funnel gating: blocks only
        if (item.productType === "block") {
          const ruleItems = toRuleItems(currentItems);
          const result = canAddBlock(item.slug, ruleItems, []);
          if (!result.ok) return result;
        }

        let updated: CartItem[];
        const existing = currentItems.find((i) => i.id === item.id);
        if (existing) {
          updated = currentItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          updated = [...currentItems, { ...item, quantity: 1 }];
        }

        set({ items: recomputeGift(updated) });
        return { ok: true };
      },

      removeItem: (id) => {
        // Gift row is not user-removable
        if (id === "gift-mind") return;
        const updated = get().items.filter((i) => i.id !== id);
        set({ items: recomputeGift(updated) });
      },

      updateQuantity: (id, quantity) => {
        if (id === "gift-mind") return;
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const updated = get().items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        );
        set({ items: recomputeGift(updated) });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "genesis-cart",
    }
  )
);
