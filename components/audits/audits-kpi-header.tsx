import { ClipboardList, FileText, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CARD_HEADER_STACK_CLASS,
  CARD_METRIC_CLASS,
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const AUDITS_KPI_CARDS = [
  {
    eyebrow: "Policy control",
    value: "42",
    meta: "SOP documents in active workflows",
    icon: FileText,
  },
  {
    eyebrow: "Production log",
    value: "128",
    meta: "BPR batches ready for audit",
    icon: ClipboardList,
  },
  {
    eyebrow: "Site audit",
    value: "14",
    meta: "FIR checklists in progress",
    icon: MapPin,
  },
] as const;

/** Streamlined Audits KPI strip — matches Policies / Frameworks / Reports cards. */
export default function AuditsKpiHeader({ className }: { className?: string }) {
  return (
    <div className={cn(DASHBOARD_TRIPLE_CARD_GRID_CLASS, className)}>
      {AUDITS_KPI_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.eyebrow}
            className={cn("overflow-hidden", DASHBOARD_CARD_CLASS)}
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className={cn(CARD_HEADER_STACK_CLASS, "min-w-0")}>
                  <p className={CARD_SECTION_EYEBROW_CLASS}>{card.eyebrow}</p>
                  <p
                    className={cn(
                      CARD_METRIC_CLASS,
                      "m-0 tabular-nums text-neutral-900",
                    )}
                  >
                    {card.value}
                  </p>
                </div>
                <Icon className="size-4 shrink-0 text-zinc-400" aria-hidden />
              </div>
              <p className="m-0 truncate text-xs text-neutral-500">{card.meta}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
