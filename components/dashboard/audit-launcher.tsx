"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfigureAuditModal } from "@/components/configure-audit-modal/configure-audit-modal";
import {
  AUDIT_WORKFLOWS,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import { cn } from "@/lib/utils";

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(["sop", "bpr", "fir"] as const).map((id) => {
          const workflow = AUDIT_WORKFLOWS[id];
          return (
            <Card
              key={id}
              className="h-full rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <CardContent className="flex h-full flex-col items-center justify-between p-4 text-center">
                <div className="w-full">
                  <h3 className="text-h4 m-0 font-semibold leading-tight text-black">
                    {workflow.title}
                  </h3>
                  <p className="m-0 mt-3 text-sm text-black">
                    {workflow.description}
                  </p>
                  <p className="text-body2 m-0 mt-4 flex flex-wrap items-center justify-center gap-x-2 text-black">
                    <span>Status:</span>
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        workflow.status === "Active" && "bg-[#22C55E]",
                        workflow.status === "Ready" && "bg-[#F5C400]",
                        workflow.status === "Draft" && "bg-[oklch(70%_0_0)]",
                      )}
                      aria-hidden
                    />
                    <span>{workflow.status}</span>
                    <span aria-hidden>•</span>
                    <span>Last run: {workflow.lastRun}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "black" }),
                    "mt-4 w-full",
                  )}
                  onClick={() => openFor(id)}
                >
                  {workflow.cta}
                </button>
              </CardContent>
            </Card>
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
