import type { ReactNode } from "react";
import { SECTION_HEADER_CLASS } from "@/lib/page-layout";
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
        "mb-6",
        actions && "flex items-start justify-between gap-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className={cn(SECTION_HEADER_CLASS, "m-0 text-black")}>
          {title}
        </h2>
        {description ? (
          <p className="m-0 mt-1 max-w-xl text-sm font-normal text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
