"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import {
  OPEN_FINDINGS,
  type FindingRow,
  type FindingSeverity,
  type FindingStatus,
} from "@/lib/dashboard-insights";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER: FindingSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

function sortFindings(rows: FindingRow[]) {
  return [...rows].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
}

function severityClass(severity: FindingSeverity) {
  if (severity === "Critical" || severity === "High") {
    return "bg-[oklch(93%_0.05_25)] text-[oklch(38%_0.12_25)]";
  }
  if (severity === "Medium") {
    return "bg-[oklch(96%_0.06_95)] text-[oklch(42%_0.1_85)]";
  }
  return "bg-[oklch(94%_0_0)] text-[oklch(40%_0_0)]";
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
          ? { ...row, owner: owner.trim(), status: "In Remediation" }
          : row,
      ),
    );
    toast.success(`CAPA logged for ${active.id}`);
    setOwner("");
    setPlan("");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full min-w-[880px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 w-[28%]">Finding</TableHead>
                  <TableHead className="w-[16%]">Document</TableHead>
                  <TableHead className="w-[12%]">Severity</TableHead>
                  <TableHead className="w-[16%]">Citation</TableHead>
                  <TableHead className="w-[12%]">Owner</TableHead>
                  <TableHead className="px-6 w-[16%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "cursor-pointer hover:bg-transparent",
                      active?.id === row.id && "bg-[oklch(97%_0_0)]",
                    )}
                    onClick={() => setActiveId(row.id)}
                  >
                    <TableCell className="px-6 font-medium">{row.title}</TableCell>
                    <TableCell>{row.document}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("border-0 font-medium", severityClass(row.severity))}
                      >
                        {row.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.citation}</TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell className="px-6" onClick={(event) => event.stopPropagation()}>
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          updateStatus(row.id, value as FindingStatus)
                        }
                      >
                        <SelectTrigger className="h-9 rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Remediation">
                            In Remediation
                          </SelectItem>
                          <SelectItem value="Pending Verification">
                            Pending Verification
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

      <Card className="rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <h3 className="text-h4 m-0 font-semibold text-foreground">
              Log corrective action
            </h3>
            <p className="text-body2 m-0 mt-1 text-muted-foreground">
              Assign a remediation owner and CAPA notes for{" "}
              {active ? active.title : "the selected finding"}.
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
              className="rounded-full"
              onClick={logCapa}
            >
              Assign owner / log CAPA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
