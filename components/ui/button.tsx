import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/** Dashboard CTA geometry: 48px tall, 8px radius, Engineering Blue primary. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 text-button font-medium shadow-none h-[length:var(--cta-height)] min-h-[length:var(--cta-height)] px-6 py-3 transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 [&_svg]:text-current outline-none focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] hover:text-primary-foreground active:bg-[var(--primary-active)] active:text-primary-foreground disabled:bg-muted disabled:text-neutral-900/40 [&_svg]:text-primary-foreground",
        black:
          "border-0 bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] hover:text-primary-foreground active:bg-[var(--primary-active)] active:text-primary-foreground disabled:bg-muted disabled:text-neutral-900/40 [&_svg]:text-primary-foreground",
        destructive:
          "bg-status-critical text-status-critical-foreground hover:bg-red-700 active:bg-red-800 focus-visible:ring-status-critical/30",
        outline:
          "border border-[oklch(0%_0_0)] bg-transparent text-foreground hover:bg-[var(--interactive-hover)] hover:text-primary dark:border-white color:border-white dark:hover:bg-[var(--interactive-hover)] color:hover:bg-[var(--interactive-hover)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
        ghost: "text-foreground hover:bg-[var(--interactive-hover)] hover:text-primary",
        muted:
          "bg-zinc-200 text-foreground hover:bg-[var(--interactive-hover-strong)] hover:text-primary active:bg-[var(--primary-soft)] disabled:bg-muted disabled:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-[var(--primary-hover)]",
      },
      size: {
        default: "px-6 py-3",
        xs: "px-6 py-3 text-caption [&_svg:not([class*='size-'])]:size-5",
        sm: "px-6 py-3 [&_svg:not([class*='size-'])]:size-5",
        lg: "px-6 py-3",
        icon: "px-6 py-3 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "px-6 py-3 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "px-6 py-3 [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "px-6 py-3 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
