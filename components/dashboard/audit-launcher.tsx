"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ConfigureAuditModal } from "@/components/configure-audit-modal/configure-audit-modal";
import {
  AUDIT_WORKFLOWS,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import { DASHBOARD_GAP_CLASS, INTERACTIVE_CARD_CLASS } from "@/lib/page-layout";
import { workflowStatusDotClass } from "@/lib/chart-tokens";
import { cn } from "@/lib/utils";

const CARD_CLASS = cn(
  INTERACTIVE_CARD_CLASS,
  "group flex h-full w-full min-w-0 flex-col text-left text-inherit",
);

const CTA_CLASS =
  "inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-black transition-colors";

/** Prefer natural multi-line breaks (e.g. "Facility Inspection" stays on one line). */
const TITLE_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Standard Operating Procedures",
  bpr: "Batch Production Records",
  fir: "Facility\u00A0Inspection Report",
};

export default function AuditLauncher() {
  const [open, setOpen] = React.useState(false);
  const [workflowId, setWorkflowId] =
    React.useState<AuditWorkflowId>("sop");

  function openFor(id: AuditWorkflowId) {
    setWorkflowId(id);
    setOpen(true);
  }

  return (
    <>
      <div
        className={cn(
          "grid w-full grid-cols-1 md:grid-cols-3",
          DASHBOARD_GAP_CLASS,
        )}
      >
        {(["sop", "bpr", "fir"] as const).map((id) => {
          const workflow = AUDIT_WORKFLOWS[id];
          return (
            <button
              key={id}
              type="button"
              className={CARD_CLASS}
              onClick={() => openFor(id)}
              aria-label={`Configure ${workflow.title}`}
            >
              <Card className="h-full w-full border-0 bg-transparent shadow-none">
                <CardContent className="flex h-full min-h-[220px] w-full flex-col p-4 text-left">
                  <p className="text-sm font-medium m-0 text-black">
                    {workflow.title}
                  </p>
                  <h3 className="text-h4 m-0 mt-2 max-w-full text-balance font-semibold leading-snug text-black">
                    {TITLE_DISPLAY[id]}
                  </h3>

                  <p className="text-body1 m-0 mt-5 flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-black">
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

                  <div className="mt-auto flex w-full justify-end pt-8">
                    <span className={CTA_CLASS}>
                      <span className="group-hover:underline">
                        Configure Audit
                      </span>
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <ConfigureAuditModal
        open={open}
        onOpenChange={setOpen}
        workflowId={workflowId}
      />
    </>
  );
}
