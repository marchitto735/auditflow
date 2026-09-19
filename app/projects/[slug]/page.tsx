import React from "react";

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] px-6 py-4 md:px-8 md:py-4 lg:py-24">
      <h1>Project: {params.slug}</h1>
      {/* Project Content */}
    </div>
  );
}
