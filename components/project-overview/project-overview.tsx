"use client";

import { cn } from "@/lib/utils";

const DEFAULT_TASK =
  "Lorem ipsum dolor sit amet consectetur. Sed at tincidunt tempor sagittis erat congue ut rhoncus.";

export type ProjectOverviewProps = {
  intro?: string;
  situation: string;
  action: string;
  result: string;
  task?: string;
  className?: string;
};

export default function ProjectOverview({
  intro,
  situation,
  action,
  result,
  task = DEFAULT_TASK,
  className,
}: ProjectOverviewProps) {
  return (
    <section className={cn("w-full pt-4 text-left min-w-0", className)}>
      {intro ? (
        <>
          <h2 className="text-h2 font-light text-foreground">Summary</h2>
          <h4 className="text-h4 text-foreground mt-4 max-w-2xl">{intro}</h4>
        </>
      ) : null}
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4 lg:gap-4",
          intro ? "mt-4 md:mt-[128px]" : null,
        )}
      >
        <div className="min-w-0">
          <h3 className="text-h3 text-foreground mb-3">Situation</h3>
          <p className="text-body1 text-foreground">{situation}</p>
        </div>
        <div className="min-w-0">
          <h3 className="text-h3 text-foreground mb-3">Task</h3>
          <p className="text-body1 text-foreground">{task}</p>
        </div>
        <div className="min-w-0">
          <h3 className="text-h3 text-foreground mb-3">Action</h3>
          <p className="text-body1 text-foreground">{action}</p>
        </div>
        <div className="min-w-0">
          <h3 className="text-h3 text-foreground mb-3">Result</h3>
          <p className="text-body1 text-foreground">{result}</p>
        </div>
      </div>
    </section>
  );
}
