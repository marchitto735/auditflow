import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a&]:hover:bg-[var(--primary-hover)]",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-status-critical text-status-critical-foreground focus-visible:ring-status-critical/30 [a&]:hover:bg-red-700",
        success:
          "bg-status-success text-status-success-foreground [a&]:hover:bg-emerald-700",
        warning:
          "bg-status-warning text-status-warning-foreground [a&]:hover:bg-amber-600",
        outline:
          "border-border text-foreground [a&]:hover:bg-[var(--interactive-hover)] [a&]:hover:text-primary",
        ghost: "[a&]:hover:bg-[var(--interactive-hover)] [a&]:hover:text-primary",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
