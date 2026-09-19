"use client";

import { cn } from "@/lib/utils";

type TagProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-3 py-1.5 text-foreground [font-size:var(--text-body2-size)] [line-height:var(--line-height-body2)] [font-weight:var(--font-weight-body2)]",
        className
      )}
    >
      {children}
    </span>
  );
}
