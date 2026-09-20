"use client";

import * as React from "react";
import { ConfigureAuditModal } from "@/components/configure-audit-modal/configure-audit-modal";
import type { AuditWorkflowId } from "@/lib/audit-workflows";

type ConfigureAuditContextValue = {
  open: boolean;
  /** Prefill when opened from a dashboard card; null when opened blank from New Audit. */
  initialWorkflowId: AuditWorkflowId | null;
  openConfigureAudit: (workflowId?: AuditWorkflowId | null) => void;
  setConfigureAuditOpen: (open: boolean) => void;
};

const ConfigureAuditContext =
  React.createContext<ConfigureAuditContextValue | null>(null);

export function ConfigureAuditProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [initialWorkflowId, setInitialWorkflowId] =
    React.useState<AuditWorkflowId | null>(null);

  const openConfigureAudit = React.useCallback(
    (workflowId?: AuditWorkflowId | null) => {
      setInitialWorkflowId(workflowId ?? null);
      setOpen(true);
    },
    [],
  );

  const value = React.useMemo(
    () => ({
      open,
      initialWorkflowId,
      openConfigureAudit,
      setConfigureAuditOpen: setOpen,
    }),
    [open, initialWorkflowId, openConfigureAudit],
  );

  return (
    <ConfigureAuditContext.Provider value={value}>
      {children}
      <ConfigureAuditModal
        open={open}
        onOpenChange={setOpen}
        initialWorkflowId={initialWorkflowId}
      />
    </ConfigureAuditContext.Provider>
  );
}

export function useConfigureAudit() {
  const ctx = React.useContext(ConfigureAuditContext);
  if (!ctx) {
    throw new Error(
      "useConfigureAudit must be used within ConfigureAuditProvider",
    );
  }
  return ctx;
}
