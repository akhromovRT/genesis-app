"use client";

import { useCartStore, type CartItem } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  test: Omit<CartItem, "quantity">;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AddToCartButton({ test, size = "default", className }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(test);
    setAdded(true);
    toast.success(`${test.name} добавлен в корзину`);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      size={size}
      className={className}
      onClick={handleAdd}
      disabled={added}
    >
      {added ? (
        <>
          <Check className="mr-1.5 h-4 w-4" />
          Добавлено
        </>
      ) : (
        <>
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          В корзину
        </>
      )}
    </Button>
  );
}
