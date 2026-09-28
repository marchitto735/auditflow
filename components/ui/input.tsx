import * as React from "react"

import { FIELD_CONTROL_CLASS } from "@/lib/page-layout"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg px-3 py-2 text-body1 file:border-0 file:bg-transparent file:text-body2 file:font-medium file:text-neutral-900 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 md:text-body2",
          FIELD_CONTROL_CLASS,
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
