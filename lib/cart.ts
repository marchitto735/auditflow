import type { GmpClause } from "@/lib/gmp-clauses";

export const CART_STORAGE_KEY = "auditflow-cart-v1";
export const GOLD_STANDARD_UNIT_PRICE_CENTS = 24900;
export const CART_TAX_RATE = 0.0825;

export type CartCatalogItem = {
  sku: string;
  title: string;
  description: string;
  clauseId: string;
  unitPriceCents: number;
};

export type CartLineItem = CartCatalogItem & {
  quantity: number;
};

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function goldStandardCatalogItem(
  clause: GmpClause | undefined,
  documentType?: string | null,
): CartCatalogItem {
  const clauseId = clause?.id ?? "27";
  const shortName = clause?.shortName ?? "Doc Practices";
  const docType = documentType?.trim() || "SOP";
  const skuDoc = docType.replace(/\s+/g, "").toUpperCase();

  return {
    sku: `GS-${skuDoc}-${clauseId}`,
    title: `Gold Standard SOP — Clause ${clauseId} Compliance Package`,
    description: `${shortName} ${docType} aligned to ${clause?.section ?? "GMP documentation practices"}.`,
    clauseId,
    unitPriceCents: GOLD_STANDARD_UNIT_PRICE_CENTS,
  };
}

export function cartTotals(items: CartLineItem[]) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const taxCents = Math.round(subtotalCents * CART_TAX_RATE);
  const totalCents = subtotalCents + taxCents;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotalCents, taxCents, totalCents, itemCount };
}

export function parseStoredCart(raw: string | null): CartLineItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const item = entry as Partial<CartLineItem>;
        if (
          typeof item.sku !== "string" ||
          typeof item.title !== "string" ||
          typeof item.unitPriceCents !== "number"
        ) {
          return null;
        }

        return {
          sku: item.sku,
          title: item.title,
          description:
            typeof item.description === "string" ? item.description : "",
          clauseId: typeof item.clauseId === "string" ? item.clauseId : "",
          unitPriceCents: item.unitPriceCents,
          quantity: Math.max(1, Math.min(9, Number(item.quantity) || 1)),
        } satisfies CartLineItem;
      })
      .filter((item): item is CartLineItem => item !== null);
  } catch {
    return [];
  }
}
