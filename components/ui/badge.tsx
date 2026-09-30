import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/**
 * Telemetry status — a semantic dot and plain text, no pill fill.
 * Green is operational or compliant, amber is warning, open, or
 * remediation, and red is an error or non-compliant state.
 */
export type BadgeTone = "success" | "warning" | "danger" | "neutral"

const TONE_DOT: Record<BadgeTone, string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-critical",
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
  "inline-flex w-fit shrink-0 items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-normal leading-none whitespace-nowrap text-foreground shadow-none"

/** @deprecated Shell is universal; kept for typed helpers that imported cva variants. */
const badgeVariants = Object.assign(
  () => BADGE_SHELL_CLASS,
  { raw: BADGE_SHELL_CLASS },
)

function Badge({
  className,
  tone,
  variant = "outline",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  asChild?: boolean
  /** Semantic indicator tone — preferred over legacy `variant`. */
  tone?: BadgeTone
  /** Legacy alias mapped onto `tone`. */
  variant?: BadgeVariant
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
      <span
        className={cn(
          "size-2.5 shrink-0 self-center rounded-full",
          TONE_DOT[resolvedTone],
        )}
        aria-hidden
      />
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants, toneFromVariant }
