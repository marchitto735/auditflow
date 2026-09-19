"use client";
import React from "react";

import Tag from "@/components/ui/tag";
import { cn } from "@/lib/utils";

const DEFAULT_TITLE = "Lorem ipsum dolor sit amet consectegtur.";
const DEFAULT_SUBTITLE =
  "A refreshed experience that streamlines research ingestion, improves navigation, and introduces a consistent visual system for internal teams.";

export type ProjectHeroProps = {
  tags: string[];
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function ProjectHero({
  tags,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  className,
}: ProjectHeroProps) {
  return (
    <section
      className={cn(
        "pt-[17px] md:pt-[33px] lg:pt-[65px] pb-0 md:pb-[48px] mb-4 md:mb-20 text-left min-w-0",
        className
      )}
    >
      <h1 className="text-h1 font-light text-foreground min-w-0">
        {title}
      </h1>
      <h4 className="text-h4 text-foreground mt-4 max-w-2xl">
        {subtitle.includes("\n")
          ? subtitle.split("\n").map((line, idx, arr) => (
              <React.Fragment key={idx}>
                {line}
                {idx < arr.length - 1 ? <br /> : null}
              </React.Fragment>
            ))
          : subtitle}
      </h4>
      <div
        className="project-hero-metadata mt-[48px] flex flex-row flex-wrap items-center gap-4"
        aria-label="Project metadata"
      >
        {tags.map((label, i) => (
          <Tag key={`${label}-${i}`}>{label}</Tag>
        ))}
      </div>
    </section>
  );
}
