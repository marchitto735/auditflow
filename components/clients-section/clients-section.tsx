"use client";

import React from "react";
import ProjectCard from "@/components/project-card/project-card";

export type ClientsSectionProps = {
  projects: Array<{
    title: string;
    description: string;
    image: string;
    href?: string;
    ctaLabel?: string;
    runAudit?: boolean;
    auditWorkflow?: "sop" | "bpr" | "fir";
  }>;
};

export default function ClientsSection({ projects }: ClientsSectionProps) {
  return (
    <section className="w-full min-w-0 flex flex-col pt-0 pb-0 bg-transparent">
      <div className="w-full min-w-0 px-6 md:px-8">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col min-w-0">
          <div className="w-full min-w-0 flex flex-col pt-4 md:pt-4 lg:pt-4 px-0 lg:px-4 gap-4 bg-transparent">
            {projects.map((project, i) => (
              <ProjectCard
                key={i}
                title={project.title}
                description={project.description}
                image={project.image}
                href={project.href}
                ctaLabel={project.ctaLabel}
                runAudit={project.runAudit}
                auditWorkflow={project.auditWorkflow}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
