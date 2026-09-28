"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TruncatedText } from "@/components/ui/truncated-text";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  OPEN_FINDINGS,
  type FindingRow,
  type FindingSeverity,
  type FindingStatus,
} from "@/lib/dashboard-insights";
import { DASHBOARD_CARD_CLASS, DASHBOARD_GAP_CLASS, CARD_EYEBROW_MUTED_CLASS } from "@/lib/page-layout";
import { severityBadgeVariant } from "@/lib/chart-tokens";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER: FindingSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const STATUS_SHORT_LABEL: Record<FindingStatus, string> = {
  Open: "Open",
  Remediation: "Remediation",
  "Pending verification": "Pending verification",
};

function findingStatusBadgeVariant(status: FindingStatus) {
  switch (status) {
    case "Open":
    case "Remediation":
      return "warning" as const;
    case "Pending verification":
      return "success" as const;
    default:
      return "outline" as const;
  }
}

function sortFindings(rows: FindingRow[]) {
  return [...rows].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
}

function SeverityStatus({ severity }: { severity: FindingSeverity }) {
  return <Badge variant={severityBadgeVariant(severity)}>{severity}</Badge>;
}

export default function FindingsView() {
  const [rows, setRows] = useState<FindingRow[]>(OPEN_FINDINGS);
  const [activeId, setActiveId] = useState<string | null>(
    () => sortFindings(OPEN_FINDINGS)[0]?.id ?? null,
  );
  const [owner, setOwner] = useState("");
  const [plan, setPlan] = useState("");

  const sorted = useMemo(() => sortFindings(rows), [rows]);

  const active = sorted.find((row) => row.id === activeId) ?? sorted[0];

  function updateStatus(id: string, status: FindingStatus) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, status } : row)),
    );
  }

  function logCapa() {
    if (!active) return;
    if (!owner.trim() || !plan.trim()) {
      toast.error("Add an owner and CAPA notes before logging.");
      return;
    }
    setRows((current) =>
      current.map((row) =>
        row.id === active.id
          ? { ...row, owner: owner.trim(), status: "Remediation" }
          : row,
      ),
    );
    toast.success(`CAPA logged for ${active.id}`);
    setOwner("");
    setPlan("");
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn("flex flex-col", DASHBOARD_GAP_CLASS)}>
        <Card className={cn("overflow-hidden", DASHBOARD_CARD_CLASS)}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full min-w-[880px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[28%] px-4">Finding</TableHead>
                    <TableHead className="w-[16%]">Document</TableHead>
                    <TableHead className="w-[12%]">Severity</TableHead>
                    <TableHead className="w-[16%]">Citation</TableHead>
                    <TableHead className="w-[12%]">Owner</TableHead>
                    <TableHead className="w-[16%] px-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "cursor-pointer hover:bg-neutral-50",
                        active?.id === row.id && "bg-[oklch(97%_0_0)]",
                      )}
                      onClick={() => setActiveId(row.id)}
                    >
                      <TableCell className="px-4">
                        <TruncatedText text={row.title} />
                      </TableCell>
                      <TableCell>
                        <TruncatedText text={row.document} />
                      </TableCell>
                      <TableCell>
                        <SeverityStatus severity={row.severity} />
                      </TableCell>
                      <TableCell>
                        <TruncatedText
                          className="font-mono tabular-nums"
                          text={row.citation}
                        />
                      </TableCell>
                      <TableCell>
                        <TruncatedText text={row.owner} />
                      </TableCell>
                      <TableCell
                        className="px-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Select
                          value={row.status}
                          onValueChange={(value) =>
                            updateStatus(row.id, value as FindingStatus)
                          }
                        >
                          <SelectTrigger
                            className="h-9 w-full min-w-0 rounded-lg border-0 bg-transparent px-0 shadow-none focus:ring-0"
                            title={row.status}
                          >
                            <SelectValue>
                              <Badge
                                variant={findingStatusBadgeVariant(row.status)}
                              >
                                {STATUS_SHORT_LABEL[row.status]}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Remediation">
                              Remediation
                            </SelectItem>
                            <SelectItem value="Pending verification">
                              Pending verification
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(DASHBOARD_CARD_CLASS)}>
          <CardContent className="flex flex-col gap-4 p-4">
            <div>
              <p className={CARD_EYEBROW_MUTED_CLASS}>
                Selected finding
              </p>
              <h3 className="text-h4 m-0 mt-1 whitespace-normal break-words font-semibold leading-[1.15] text-foreground">
                {active ? active.title : "Select a finding"}
              </h3>
              {active ? (
                <p className="text-body1 m-0 mt-2 text-muted-foreground">
                  {active.document} · {active.citation} · {active.severity}
                </p>
              ) : null}
              <p className="text-body1 m-0 mt-3 text-muted-foreground">
                Assign a remediation owner and CAPA notes below.
              </p>
            </div>
            <Input
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              placeholder="Remediation owner"
            />
            <Textarea
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              placeholder="Corrective action plan"
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="black"
                onClick={logCapa}
              >
                Assign owner / log CAPA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
