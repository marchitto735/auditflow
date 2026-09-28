"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  HELP_DIAGNOSTICS,
  HELP_SYSTEM_STATUS,
  type SystemServiceStatus,
} from "@/lib/help";
import { OVERLINE_LABEL_CLASS } from "@/lib/page-layout";

function serviceStatusBadgeVariant(
  status: SystemServiceStatus["status"],
) {
  switch (status) {
    case "Operational":
      return "success" as const;
    case "Degraded":
      return "warning" as const;
    case "Outage":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

/** Infrastructure checks + diagnostic metadata for Settings → System Health. */
export default function SystemHealthPanel() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copyValue(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(label);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  }

  return (
    <div className="grid gap-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <ul className="m-0 grid list-none gap-0 border-b border-neutral-200 p-0 md:border-b-0 md:border-r md:border-neutral-200">
        {HELP_SYSTEM_STATUS.map((service) => (
          <li
            key={service.id}
            className="flex items-start justify-between gap-4 border-b border-neutral-200 px-0 py-3 last:border-b-0 md:pr-4"
          >
            <div className="min-w-0">
              <p className="m-0 text-base font-normal text-neutral-900">
                {service.label}
              </p>
              <p className="m-0 mt-0.5 text-xs text-neutral-500">
                {service.detail}
              </p>
            </div>
            <Badge
              variant={serviceStatusBadgeVariant(service.status)}
              className="shrink-0"
            >
              {service.status}
            </Badge>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 pt-4 md:pt-0 md:pl-4">
        <p className={OVERLINE_LABEL_CLASS}>
          Diagnostic metadata
        </p>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {HELP_DIAGNOSTICS.map((item) => {
            const copied = copiedKey === item.label;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => copyValue(item.label, item.value)}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-neutral-500">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-sm text-neutral-900">
                      {item.value}
                    </span>
                  </span>
                  {copied ? (
                    <Check className="size-4 shrink-0 text-neutral-900" />
                  ) : (
                    <Copy className="size-4 shrink-0 text-neutral-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
