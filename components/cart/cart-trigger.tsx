"use client";

import { ShoppingBag } from "lucide-react";
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
        <span
          className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white"
          aria-hidden
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      ) : null}
    </Button>
  );
}
