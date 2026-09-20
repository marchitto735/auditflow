"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  ActivityStatus,
} from "@/components/activity-table/activity-table";
import { TruncatedText } from "@/components/ui/truncated-text";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type AuditLogRow } from "@/lib/dashboard-insights";
import { DASHBOARD_CARD_CLASS, DASHBOARD_GAP_CLASS, CARD_EYEBROW_MUTED_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type TypeFilter = "All" | AuditLogRow["type"];

function downloadFile(filename: string, contents: BlobPart, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]) {
  const pageHeight = 792;
  const margin = 48;
  const lineHeight = 12;
  const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight);
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    pages.push(lines.slice(i, i + maxLines));
  }
  if (pages.length === 0) pages.push([""]);

  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(
    `2 0 obj << /Type /Pages /Kids [${kids}] /Count ${pages.length} >> endobj`,
  );

  pages.forEach((pageLines, index) => {
    const pageObj = 3 + index * 2;
    const contentObj = pageObj + 1;
    objects.push(
      `${pageObj} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObj} 0 R >> endobj`,
    );
    const stream = pageLines
      .map((line, lineIndex) => {
        const y = pageHeight - margin - lineIndex * lineHeight;
        return `BT /F1 9 Tf 48 ${y} Td (${escapePdfText(line)}) Tj ET`;
      })
      .join("\n");
    objects.push(
      `${contentObj} 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    );
  });

  let offset = 9;
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  const body = objects
    .map((object) => {
      xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
      const chunk = `${object}\n`;
      offset += chunk.length;
      return chunk;
    })
    .join("");
  return `%PDF-1.4\n${body}trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
}

export default function AuditLogView({
  rows: sourceRows,
}: {
  rows: AuditLogRow[];
}) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");

  const rows = useMemo(() => {
    if (typeFilter === "All") return sourceRows;
    return sourceRows.filter((row) => row.type === typeFilter);
  }, [sourceRows, typeFilter]);

  const passCount = rows.filter((row) => row.status === "Compliant").length;
  const failCount = rows.filter((row) => row.status !== "Compliant").length;
  const passRate = rows.length ? Math.round((passCount / rows.length) * 100) : 0;
  const failRate = rows.length ? Math.round((failCount / rows.length) * 100) : 0;
  const typeSplit = {
    SOP: rows.filter((row) => row.type === "SOP").length,
    BPR: rows.filter((row) => row.type === "BPR").length,
    FIR: rows.filter((row) => row.type === "FIR").length,
  };

  function exportCsv() {
    const header = "Document,Type,Date,Score,Auditor,Status";
    const body = rows
      .map((row) =>
        [row.document, row.type, row.date, row.score, row.auditor, row.status]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    downloadFile("audit-log.csv", `${header}\n${body}`, "text/csv;charset=utf-8");
  }

  function exportPdf() {
    const lines = [
      "AuditFlow Audit Log",
      `Filter: ${typeFilter}`,
      `Pass rate: ${passRate}% · Fail rate: ${failRate}%`,
      "",
      ...rows.map(
        (row) =>
          `${row.date} | ${row.type} | ${row.document} | ${row.score} | ${row.auditor} | ${row.status}`,
      ),
    ];
    downloadFile(
      "audit-log-report.pdf",
      buildSimplePdf(lines),
      "application/pdf",
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
    <div className={cn("flex flex-col", DASHBOARD_GAP_CLASS)}>
      <div
        className={cn("grid grid-cols-1 md:grid-cols-3", DASHBOARD_GAP_CLASS)}
      >
        <Card className={cn(DASHBOARD_CARD_CLASS)}>
          <CardContent className="p-4">
            <p className={CARD_EYEBROW_MUTED_CLASS}>Pass rate</p>
            <p className="text-h5 m-0 mt-2 font-semibold leading-none text-foreground">
              {passRate}%
            </p>
          </CardContent>
        </Card>
        <Card className={cn(DASHBOARD_CARD_CLASS)}>
          <CardContent className="p-4">
            <p className={CARD_EYEBROW_MUTED_CLASS}>Fail rate</p>
            <p className="text-h5 m-0 mt-2 font-semibold leading-none text-foreground">
              {failRate}%
            </p>
          </CardContent>
        </Card>
        <Card className={cn(DASHBOARD_CARD_CLASS)}>
          <CardContent className="p-4">
            <p className={CARD_EYEBROW_MUTED_CLASS}>
              Volume by type
            </p>
            <p className="text-body1 m-0 mt-2 text-foreground">
              SOP {typeSplit.SOP} · BPR {typeSplit.BPR} · FIR {typeSplit.FIR}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as TypeFilter)}
        >
          <SelectTrigger className="h-10 w-[12rem] rounded-lg">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types</SelectItem>
            <SelectItem value="SOP">SOP</SelectItem>
            <SelectItem value="BPR">BPR</SelectItem>
            <SelectItem value="FIR">FIR</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="black"
            onClick={exportCsv}
          >
            Export CSV
          </Button>
          <Button
            type="button"
            variant="black"
            onClick={exportPdf}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <Card className={cn("overflow-hidden", DASHBOARD_CARD_CLASS)}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full min-w-[720px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 w-[28%]">Document</TableHead>
                  <TableHead className="w-[10%]">Type</TableHead>
                  <TableHead className="w-[16%]">Date</TableHead>
                  <TableHead className="w-[10%]">Score</TableHead>
                  <TableHead className="w-[16%]">Auditor</TableHead>
                  <TableHead className="px-4 w-[20%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="max-w-none whitespace-normal px-4 py-4 text-muted-foreground"
                    >
                      No stored audits yet. Run an SOP, BPR, or FIR audit to
                      populate this log.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-transparent">
                    <TableCell className="px-4">
                      <TruncatedText text={row.document} />
                    </TableCell>
                    <TableCell>
                      <TruncatedText text={row.type} />
                    </TableCell>
                    <TableCell>
                      <TruncatedText text={row.date} />
                    </TableCell>
                    <TableCell>
                      <TruncatedText text={String(row.score)} />
                    </TableCell>
                    <TableCell>
                      <TruncatedText text={row.auditor} />
                    </TableCell>
                    <TableCell className="px-4">
                      <ActivityStatus status={row.status} />
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
