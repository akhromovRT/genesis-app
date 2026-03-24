"use client";

import { useCartStore } from "@/stores/cart-store";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartBadge() {
  const totalItems = useCartStore((s) => s.totalItems);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — localStorage is only available on client
  useEffect(() => setMounted(true), []);

  const count = mounted ? totalItems() : 0;

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </Link>
  );
}
