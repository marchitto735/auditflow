import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/**
 * Universal status indicator — borderless dot + label (KPI-card style).
 * No pill chrome, fills, pulse, or glow.
 */
export type BadgeTone = "success" | "warning" | "danger" | "neutral"

const TONE_DOT: Record<BadgeTone, string> = {
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  danger: "bg-rose-600",
  neutral: "bg-zinc-400",
}

/** @deprecated Prefer `tone`. Kept so existing call sites keep compiling. */
export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "outline"
  | "success-outline"

function toneFromVariant(variant: BadgeVariant | null | undefined): BadgeTone {
  switch (variant) {
    case "success":
    case "success-outline":
    case "default":
      return "success"
    case "warning":
      return "warning"
    case "destructive":
      return "danger"
    case "outline":
    default:
      return "neutral"
  }
}

const BADGE_SHELL_CLASS =
  "inline-flex w-fit shrink-0 items-center gap-1.5 overflow-visible border-0 bg-transparent p-0 leading-none text-sm font-normal whitespace-nowrap text-foreground shadow-none [&>svg]:pointer-events-none [&>svg]:size-3"

/** @deprecated Shell is universal; kept for typed helpers that imported cva variants. */
const badgeVariants = Object.assign(
  () => BADGE_SHELL_CLASS,
  { raw: BADGE_SHELL_CLASS },
)

function Badge({
  className,
  tone,
  variant = "outline",
  showDot = true,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  asChild?: boolean
  /** Semantic indicator tone — preferred over legacy `variant`. */
  tone?: BadgeTone
  /** Legacy alias mapped onto `tone`. */
  variant?: BadgeVariant
  /** When false, omit the leading status dot (e.g. cart count). */
  showDot?: boolean
}) {
  const Comp = asChild ? Slot.Root : "span"
  const resolvedTone = tone ?? toneFromVariant(variant)

  return (
    <Comp
      data-slot="badge"
      data-tone={resolvedTone}
      className={cn(BADGE_SHELL_CLASS, className)}
      {...props}
    >
      {showDot ? (
        <span
          className={cn(
            "size-2.5 shrink-0 self-center rounded-full",
            TONE_DOT[resolvedTone],
          )}
          aria-hidden
        />
      ) : null}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants, TONE_DOT, toneFromVariant }
