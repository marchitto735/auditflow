"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import {
  AUDIT_WORKFLOWS,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import {
  CARD_CONTENT_CLASS,
  CARD_CTA_ARROW_CLASS,
  CARD_CTA_CLASS,
  CARD_EYEBROW_CLASS,
  CARD_FOOTER_CLASS,
  CARD_TITLE_CLASS,
  DASHBOARD_GAP_CLASS,
  INTERACTIVE_CARD_CLASS,
} from "@/lib/page-layout";
import { workflowStatusDotClass } from "@/lib/chart-tokens";
import { cn } from "@/lib/utils";

const CARD_CLASS = cn(
  INTERACTIVE_CARD_CLASS,
  "group flex w-full min-w-0 shrink-0 flex-col text-left text-inherit",
);

/** Full name + acronym for card titles. */
const TITLE_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Standard Operating Procedure (SOP)",
  bpr: "Batch Production Record (BPR)",
  fir: "Facility\u00A0Inspection Report (FIR)",
};

export default function AuditLauncher() {
  const { openConfigureAudit } = useConfigureAudit();

  return (
    <div className={cn("flex w-full flex-col", DASHBOARD_GAP_CLASS)}>
      {(["sop", "bpr", "fir"] as const).map((id) => {
        const workflow = AUDIT_WORKFLOWS[id];
        const title = TITLE_DISPLAY[id];
        return (
          <button
            key={id}
            type="button"
            className={CARD_CLASS}
            onClick={() => openConfigureAudit(id)}
            aria-label={`Configure ${title}`}
          >
            <Card className="h-full w-full border-0 bg-transparent shadow-none">
              <CardContent
                className={cn(CARD_CONTENT_CLASS, "w-full text-left")}
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className={CARD_EYEBROW_CLASS}>Audit</p>
                  <h3
                    className={cn(
                      CARD_TITLE_CLASS,
                      "m-0 max-w-full text-balance text-black",
                    )}
                  >
                    {title}
                  </h3>
                  <p className="text-body1 m-0 flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-black">
                    <span>Status:</span>
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        workflowStatusDotClass(workflow.status),
                      )}
                      aria-hidden
                    />
                    <span>{workflow.status}</span>
                    <span aria-hidden>•</span>
                    <span>Last run: {workflow.lastRun}</span>
                  </p>
                </div>

                <div className={CARD_FOOTER_CLASS}>
                  <span className={CARD_CTA_CLASS}>
                    <span>Configure Audit</span>
                    <ChevronRight className={CARD_CTA_ARROW_CLASS} aria-hidden />
                  </span>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
