"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SelectStepProps = {
  selectedLabel: string;
  timeFormat: "12h" | "24h";
  onTimeFormatChange: (v: "12h" | "24h") => void;
  slots: Array<{
    value: string;
    label: string;
  }>;
  onSlotSelect: (timeValue: string) => void;
};

const SelectStep = React.memo(function SelectStep({
  selectedLabel,
  timeFormat,
  onTimeFormatChange,
  slots,
  onSlotSelect,
}: SelectStepProps) {
  return (
    <div className="flex flex-col min-h-0">
      <div data-slot="scheduling-right-header" className="mb-2 flex items-center justify-between gap-2 rounded-none bg-transparent p-0">
        <span className="text-subtitle1 text-foreground dark:text-white color:text-white">{selectedLabel}</span>
        <Tabs value={timeFormat} onValueChange={(v) => onTimeFormatChange(v as "12h" | "24h")}>
          <div className="scheduling-toggle inline-flex items-center gap-0" data-slot="scheduling-toggle-wrap">
            <TabsList
              noBg
              data-slot="scheduling-toggle"
              className="inline-flex items-center gap-1 p-0 border-0 shadow-none min-w-0 h-auto bg-transparent"
            >
              <TabsTrigger
                value="12h"
                className={cn(
                  "rounded-sm px-2.5 py-1 transition-colors text-[length:var(--text-button-size)] leading-[var(--line-height-button)] font-[var(--font-weight-button)] border",
                  timeFormat === "12h"
                    ? "border border-border dark:border-[oklch(30%_0.01_264)] color:border-[oklch(44%_0.035_165)] bg-muted dark:bg-[oklch(26%_0.01_264)] color:bg-[oklch(38%_0.035_165)] text-foreground dark:text-white color:text-white"
                    : "bg-transparent text-[oklch(55%_0_0)] border-transparent hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)]"
                )}
              >
                12h
              </TabsTrigger>
              <TabsTrigger
                value="24h"
                className={cn(
                  "rounded-sm px-2.5 py-1 transition-colors text-[length:var(--text-button-size)] leading-[var(--line-height-button)] font-[var(--font-weight-button)] border",
                  timeFormat === "24h"
                    ? "border border-border dark:border-[oklch(30%_0.01_264)] color:border-[oklch(44%_0.035_165)] bg-muted dark:bg-[oklch(26%_0.01_264)] color:bg-[oklch(38%_0.035_165)] text-foreground dark:text-white color:text-white"
                    : "bg-transparent text-[oklch(55%_0_0)] border-transparent hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)]"
                )}
              >
                24h
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
      <span className="text-subtitle2 font-medium text-foreground dark:text-white color:text-white mt-1.5 mb-5 shrink-0 block w-full text-center">Time Slot</span>
      <div className="-mt-3 flex flex-col overflow-y-auto min-w-0 flex-1 min-h-0 lg:max-h-[272px]" data-slot="scheduling-time-slots">
        <div className="flex flex-col gap-2 pt-0 pb-4 lg:pb-4">
          {slots.map(({ value, label }) => (
            <Button
              key={value}
              variant="outline"
              data-slot="scheduling-time-slot-btn"
              className="w-full justify-center"
              onClick={() => onSlotSelect(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

export { SelectStep };
