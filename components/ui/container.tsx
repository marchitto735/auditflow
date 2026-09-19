import { cn } from "@/lib/utils"

type ContainerProps = React.ComponentProps<"div"> & {
  variant?: "default" | "wide" | "narrow"
}

export function Container({ className, variant = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        variant === "wide" && "mx-auto w-full max-w-[1400px]",
        variant === "narrow" && "mx-auto w-full max-w-[640px]",
        variant === "default" && "mx-auto w-full",
        className
      )}
      {...props}
    />
  )
}
