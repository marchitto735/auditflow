import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Equal-width primary + secondary CTA row. Stacks to one column on narrow widths. */
export function CtaPair({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full min-w-0 grid-cols-2 gap-3 [&>*]:box-border [&>*]:h-[length:var(--cta-height)] [&>*]:min-h-[length:var(--cta-height)] [&>*]:w-full [&>*]:min-w-0 [&>*]:max-w-none [&>*]:justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
