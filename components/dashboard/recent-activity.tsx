"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActivityTable,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import {
  CardActionsMenu,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import { Card, CardContent } from "@/components/ui/card";
import { TablePaginationBar } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  RECENT_ACTIVITY_CARD_HEIGHT_CLASS,
} from "@/lib/page-layout";

const DEFAULT_PAGE_SIZE = 3;
/** Demo catalog size for pagination chrome when fewer stored reports exist. */
const DEMO_TOTAL_RESULTS = 194;

/** Match ActivityTable `table-fixed` + colgroup so footer locks to the same grid. */
const ACTIVITY_TABLE_MIN_WIDTH_CLASS = "min-w-[42rem]";

/** Stable SSR/CSR date string — avoid `toLocaleString()` hydration drift. */
function formatDemoDate(utcMinutesOffset: number) {
  const minutes = 50 - utcMinutesOffset;
  const mm = String(Math.max(0, minutes)).padStart(2, "0");
  return `9/19/2026, 1:${mm}:44 AM`;
}

/** Seeded first-page demos for the default page size. */
const SEED_ACTIVITY_ROWS: ActivityRow[] = [
  {
    id: "demo-activity-0",
    document: "d4463c58-f981-45cf-ac12…",
    type: "SOP",
    date: formatDemoDate(0),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-1",
    document: "a91e2b07-3c44-4d1a-9f08…",
    type: "SOP",
    date: formatDemoDate(1),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-2",
    document: "7c0f18e2-bb5a-4e91-82d3…",
    type: "SOP",
    date: formatDemoDate(2),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-3",
    document: "e2b4d901-6a17-48c0-b5fe…",
    type: "SOP",
    date: formatDemoDate(3),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-4",
    document: "5f83a1c0-29de-4b6f-91aa…",
    type: "SOP",
    date: formatDemoDate(4),
    score: "85",
    status: "Partial",
  },
];

function padActivityRows(rows: ActivityRow[], targetCount: number): ActivityRow[] {
  const seeded =
    rows.length > 0
      ? rows
      : SEED_ACTIVITY_ROWS.slice(
          0,
          Math.min(SEED_ACTIVITY_ROWS.length, targetCount),
        );
  if (seeded.length >= targetCount) return seeded;
  const padded = [...seeded];
  for (let index = padded.length; index < targetCount; index += 1) {
    const seed = (index + 1).toString(16).padStart(8, "0");
    padded.push({
      id: `demo-activity-${index}`,
      document: `${seed}${seed}${seed.slice(0, 4)}…`,
      type: index % 3 === 0 ? "BPR" : index % 5 === 0 ? "FIR" : "SOP",
      date: formatDemoDate(index % 40),
      score: String(80 + (index % 15)),
      status: index % 7 === 0 ? "Compliant" : "Partial",
    });
  }
  return padded;
}

export default function RecentActivity({
  rows,
  className,
}: {
  rows: ActivityRow[];
  className?: string;
}) {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const catalog = useMemo(
    () => padActivityRows(rows, Math.max(DEMO_TOTAL_RESULTS, pageSize)),
    [rows, pageSize],
  );

  const totalCount = catalog.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = catalog.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  function handlePageSizeChange(value: string) {
    const scrollY = window.scrollY;
    setPageSize(Number(value));
    setPage(1);
    // React commits the taller table after this frame; restore the window
    // so growth below the fold does not yank the viewport.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  }

  return (
    <Card
      className={cn(
        "flex shrink-0 flex-col overflow-hidden",
        RECENT_ACTIVITY_CARD_HEIGHT_CLASS,
        DASHBOARD_CARD_CLASS,
        className,
      )}
    >
      <CardContent className="flex flex-col p-0">
        <div className="relative shrink-0 border-b border-zinc-200 px-4 pt-[16px] pb-3">
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Audit History</p>
            <p className="m-0 mt-2 text-base font-normal text-neutral-600">
              Completed audits with scores, status, and document type.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Audit History"
              actions={TABLE_CARD_MENU_ACTIONS}
            />
          </div>
        </div>

        <div
          className="flex shrink-0 flex-col"
          style={{ overflowAnchor: "none" }}
        >
          <ActivityTable rows={pageRows} />

          <TablePaginationBar
            className={ACTIVITY_TABLE_MIN_WIDTH_CLASS}
            pageRowsCount={pageRows.length}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            paginationLabel="Activity table pagination"
          />
        </div>
      </CardContent>
    </Card>
  );
}
