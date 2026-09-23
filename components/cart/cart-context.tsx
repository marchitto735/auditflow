"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  CART_STORAGE_KEY,
  cartTotals,
  parseStoredCart,
  type CartCatalogItem,
  type CartLineItem,
} from "@/lib/cart";
type CartView = "cart" | "checkout" | "success";

type CartContextValue = {
  items: CartLineItem[];
  isOpen: boolean;
  view: CartView;
  itemCount: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  lastOrderNumber: string | null;
  openCart: () => void;
  closeCart: () => void;
  setView: (view: CartView) => void;
  addItem: (item: CartCatalogItem) => void;
  setQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  hasSku: (sku: string) => boolean;
  completeOrder: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CartView>("cart");
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    setItems(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const totals = useMemo(() => cartTotals(items), [items]);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    setView((current) => (current === "success" ? "cart" : current));
  }, []);

  const addItem = useCallback((item: CartCatalogItem) => {
    setItems((current) => {
      if (current.some((line) => line.sku === item.sku)) {
        return current;
      }
      return [...current, { ...item, quantity: 1 }];
    });
    setView("cart");
    setIsOpen(true);
    toast.success("Added to cart");
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setItems((current) =>
      current
        .map((line) =>
          line.sku === sku
            ? { ...line, quantity: Math.max(0, Math.min(9, quantity)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((current) => current.filter((line) => line.sku !== sku));
  }, []);

  const hasSku = useCallback(
    (sku: string) => items.some((line) => line.sku === sku),
    [items],
  );

  const completeOrder = useCallback(() => {
    const orderNumber = `AF-${Date.now().toString().slice(-8)}`;
    setLastOrderNumber(orderNumber);
    setItems([]);
    setView("success");
    toast.success("Order confirmed");
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      view,
      itemCount: totals.itemCount,
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      lastOrderNumber,
      openCart,
      closeCart,
      setView,
      addItem,
      setQuantity,
      removeItem,
      hasSku,
      completeOrder,
    }),
    [
      addItem,
      closeCart,
      completeOrder,
      hasSku,
      isOpen,
      items,
      lastOrderNumber,
      openCart,
      removeItem,
      setQuantity,
      totals.itemCount,
      totals.subtotalCents,
      totals.taxCents,
      totals.totalCents,
      view,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
