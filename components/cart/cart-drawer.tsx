"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/components/cart/cart-context";
import { formatUsd } from "@/lib/cart";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    view,
    closeCart,
    setView,
    setQuantity,
    removeItem,
    subtotalCents,
    taxCents,
    totalCents,
    completeOrder,
    lastOrderNumber,
  } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open) closeCart();
  }

  async function handlePlaceOrder(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    completeOrder();
    setSubmitting(false);
    setName("");
    setEmail("");
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full min-h-0 flex-col overflow-hidden sm:max-w-md"
        closeButtonClassName="top-5 right-5"
      >
        <SheetHeader className="px-4 py-4 pr-4">
          <SheetTitle>
            {view === "checkout"
              ? "Checkout"
              : view === "success"
                ? "Order confirmed"
                : "Your cart"}
          </SheetTitle>
          <SheetDescription>
            {view === "checkout"
              ? "Enter your details to complete this compliance package order."
              : view === "success"
                ? "A confirmation will be sent to the email you provided."
                : "Gold Standard SOP packages stay in your cart until checkout."}
          </SheetDescription>
        </SheetHeader>
        <Separator />

        {view === "success" ? (
          <div className="flex flex-1 flex-col px-4 py-4">
            <p className="text-body1 text-foreground m-0">
              Order {lastOrderNumber} is confirmed. You can keep reviewing the
              audit report while we prepare your compliant SOP package.
            </p>
            <SheetFooter className="mt-auto gap-3 pt-4">
              <Button
                type="button"
                variant="black"
                size="lg"
                className="w-full"
                onClick={closeCart}
              >
                Continue reviewing
              </Button>
            </SheetFooter>
          </div>
        ) : view === "checkout" ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handlePlaceOrder}
          >
            <ScrollArea className="min-h-0 flex-1">
              <div className="px-4 py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cart-checkout-name">Name</Label>
                    <Input
                      id="cart-checkout-name"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cart-checkout-email">Email</Label>
                    <Input
                      id="cart-checkout-email"
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <SummaryRow label="Subtotal" value={formatUsd(subtotalCents)} />
                  <SummaryRow
                    label="Estimated tax (8.25%)"
                    value={formatUsd(taxCents)}
                  />
                  <SummaryRow
                    label="Total"
                    value={formatUsd(totalCents)}
                    strong
                  />
                </div>
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="gap-3 px-4 py-4">
              <Button
                type="submit"
                variant="black"
                size="lg"
                className="w-full"
                disabled={submitting || items.length === 0}
              >
                {submitting ? "Placing order…" : "Place order"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setView("cart")}
              >
                Back to cart
              </Button>
            </SheetFooter>
          </form>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1">
              <div className="px-4 py-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                    <ShoppingBag className="size-8 text-muted-foreground" />
                    <p className="text-body1 text-muted-foreground m-0">
                      Your cart is empty.
                    </p>
                  </div>
                ) : (
                  <ul className="m-0 flex list-none flex-col p-0">
                    {items.map((item, index) => (
                      <li key={item.sku}>
                        {index > 0 ? <Separator className="my-5" /> : null}
                        <p className="text-body1-strong text-foreground m-0">
                          {item.title}
                        </p>
                        <p className="text-body2 text-muted-foreground m-0 mt-1">
                          SKU {item.sku}
                        </p>
                        <p className="text-body2 text-foreground m-0 mt-2">
                          {item.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-lg border border-border">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 min-h-8 min-w-8 rounded-sm p-0"
                              onClick={() =>
                                setQuantity(item.sku, item.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${item.title}`}
                            >
                              <Minus className="size-4" />
                            </Button>
                            <Input
                              readOnly
                              value={item.quantity}
                              aria-label={`Quantity of ${item.title}`}
                              className="h-8 w-8 min-w-8 border-0 bg-transparent p-0 text-center shadow-none focus-visible:ring-0"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 min-h-8 min-w-8 rounded-sm p-0"
                              onClick={() =>
                                setQuantity(item.sku, item.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${item.title}`}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-body1-strong">
                              {formatUsd(item.unitPriceCents * item.quantity)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 min-h-8 min-w-8 p-0 text-muted-foreground"
                              onClick={() => removeItem(item.sku)}
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="gap-3 px-4 py-4">
              <div className="w-full space-y-2 pb-2">
                <SummaryRow label="Subtotal" value={formatUsd(subtotalCents)} />
                <SummaryRow
                  label="Estimated tax (8.25%)"
                  value={formatUsd(taxCents)}
                />
                <SummaryRow
                  label="Total"
                  value={formatUsd(totalCents)}
                  strong
                />
              </div>
              <Button
                type="button"
                variant="black"
                size="lg"
                className="w-full"
                disabled={items.length === 0}
                onClick={() => setView("checkout")}
              >
                Proceed to checkout
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={closeCart}
              >
                Continue reviewing
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-body1-strong text-foreground"
            : "text-body2 text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          strong
            ? "text-body1-strong text-foreground"
            : "text-body2 text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
