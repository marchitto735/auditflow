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
      <div className="w-full px-4 md:px-8 lg:px-16">
        <div className="max-w-[1328px] mx-auto flex flex-col min-w-0">
          <div className="w-full min-w-0 flex flex-col pt-6 md:pt-8 lg:pt-10 px-0 lg:px-16 gap-12 bg-transparent">
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
