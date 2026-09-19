"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GMP_THRESHOLD,
  SCORE_CATEGORIES,
  SCORE_TRENDS,
} from "@/lib/dashboard-insights";
import { DASHBOARD_CARD_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type Range = keyof typeof SCORE_TRENDS;

function scoreFill(score: number) {
  if (score < 70) return "bg-[#dc2626]";
  if (score <= 85) return "bg-[#f59e0b]";
  return "bg-[#16a34a]";
}

export default function ScoreAnalysisView() {
  const [range, setRange] = useState<Range>(90);
  const trend = SCORE_TRENDS[range];

  return (
    <div className="flex flex-col gap-4">
      <Card className={cn(DASHBOARD_CARD_CLASS)}>
        <CardContent className="p-4">
          <h3 className="m-0 text-xl font-medium tracking-tight text-foreground">
            Category breakdown
          </h3>
          <p className="m-0 mt-1 mb-4 text-sm font-normal text-muted-foreground">
            GMP threshold is {GMP_THRESHOLD}%. Bars use the same score color
            scale as the dashboard gauge.
          </p>
          <div className="flex flex-col gap-4">
            {SCORE_CATEGORIES.map((category) => (
              <div key={category.name}>
                <div className="mb-1 flex items-baseline justify-between gap-4">
                  <p className="text-body1 m-0 text-foreground">
                    {category.name}
                  </p>
                  <p className="text-body1 m-0 font-medium text-foreground">
                    {category.score}%
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                  <div
                    className={cn("h-full rounded-full", scoreFill(category.score))}
                    style={{ width: `${category.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={cn(DASHBOARD_CARD_CLASS)}>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="m-0 text-xl font-medium tracking-tight text-foreground">
                Compliance trend
              </h3>
              <p className="m-0 mt-1 text-sm font-normal text-muted-foreground">
                Benchmarked against the {GMP_THRESHOLD}% enterprise GMP
                standard.
              </p>
            </div>
            <div className="flex gap-2">
              {([30, 90, 365] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={range === value ? "black" : "outline"}
                  onClick={() => setRange(value)}
                >
                  {value}d
                </Button>
              ))}
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[...trend]}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  domain={[70, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip />
                <ReferenceLine
                  y={GMP_THRESHOLD}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#16a34a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
