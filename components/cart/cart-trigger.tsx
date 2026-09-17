"use client";

import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { NAV_UTILITY_BUTTON_CLASS } from "@/lib/page-layout";

export default function CartTrigger() {
  const { itemCount, openCart } = useCart();

  return (
    <Button
      type="button"
      variant="ghost"
      className={`${NAV_UTILITY_BUTTON_CLASS} pointer-events-auto relative`}
      onClick={openCart}
      aria-label={
        itemCount > 0 ? `Open cart, ${itemCount} items` : "Open cart"
      }
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 ? (
        <Badge
          variant="default"
          className="absolute top-0 right-0 h-4 min-w-4 justify-center border-0 bg-amber-700 px-1 py-0 text-[10px] text-white hover:bg-amber-700"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </Badge>
      ) : null}
    </Button>
  );
}
