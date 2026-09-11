"use client";

import ClientsSection from "@/components/clients-section/clients-section";
import Footer from "@/components/footer/footer";
import { HOME_PROJECT_CARDS } from "@/lib/portfolio-projects";

export default function Home() {
  return (
    <>
      <main className="min-h-screen min-w-0 pb-0 md:pb-4">
        <div className="mt-0">
          <ClientsSection
            projects={HOME_PROJECT_CARDS.filter((project) => project.runAudit)}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
