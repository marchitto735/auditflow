import type { ReactNode } from "react";
import {
  SECTION_DESCRIPTION_CLASS,
  SECTION_HEADER_CLASS,
} from "@/lib/page-layout";
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
        actions && "flex items-start justify-between gap-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className={cn(SECTION_HEADER_CLASS, "m-0 text-neutral-900")}>
          {title}
        </h2>
        {description ? (
          <p className={cn(SECTION_DESCRIPTION_CLASS, "max-w-xl")}>
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
