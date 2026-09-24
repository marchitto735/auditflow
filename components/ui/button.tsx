import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/** Dashboard CTA geometry: 48px tall, 8px radius, flat black primary. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 text-button font-medium shadow-none h-[length:var(--cta-height)] min-h-[length:var(--cta-height)] px-6 py-3 transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 [&_svg]:text-current outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-black text-white hover:bg-zinc-800 hover:text-white active:bg-zinc-900 active:text-white disabled:bg-muted disabled:text-black/40 [&_svg]:text-white",
        black:
          "border-0 bg-black text-white hover:bg-zinc-800 hover:text-white active:bg-zinc-900 active:text-white disabled:bg-muted disabled:text-black/40 [&_svg]:text-white",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20",
        outline:
          "border border-[oklch(0%_0_0)] bg-transparent text-foreground hover:bg-[oklch(96%_0_0)] dark:border-white color:border-white dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent",
        muted:
          "bg-zinc-200 text-foreground hover:bg-zinc-300 active:bg-zinc-400 disabled:bg-muted disabled:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
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
