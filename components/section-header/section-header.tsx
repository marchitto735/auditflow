import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4",
        actions && "flex items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="m-0 text-2xl font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        {description ? (
          <p className="m-0 mt-1 max-w-xl text-sm text-neutral-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
