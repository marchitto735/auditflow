"use client";

import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";

export default function CartTrigger() {
  const { itemCount, openCart } = useCart();

  return (
    <Button
      type="button"
      variant="ghost"
      className="nav-button pointer-events-auto relative h-12 min-h-12 w-12 min-w-12 px-0 bg-transparent border-0 shadow-none hover:bg-[var(--sidebar-hover)]"
      onClick={openCart}
      aria-label={
        itemCount > 0 ? `Open cart, ${itemCount} items` : "Open cart"
      }
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 ? (
        <Badge
          variant="default"
          className="absolute right-1 top-1 h-4 min-w-4 justify-center border-0 bg-amber-700 px-1 py-0 text-[10px] text-white hover:bg-amber-700"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </Badge>
      ) : null}
    </Button>
  );
}
