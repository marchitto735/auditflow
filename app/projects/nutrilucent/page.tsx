"use client";

/**
 * Nutrilucent case study — structure cloned from Glorifi (`/projects/glorifi`).
 * Replace copy and image paths with Nutrilucent-specific assets when ready.
 */

import ActionAreaCard from "@/components/project-three/ActionAreaCard";
import ProjectCard from "@/components/project-card/project-card";
import ProjectHero from "@/components/project-hero/project-hero";
import ProjectOverview from "@/components/project-overview/project-overview";
import ProjectSectionHeader from "@/components/project-section-header/project-section-header";
import { getNextCaseStudyHomeCard } from "@/lib/portfolio-projects";

/** Template: same GloriFi asset paths until Nutrilucent imagery is added. */
const image_hero = "/images/nutrilucent-hero.png";

export default function NutrilucentCaseStudy() {
  const nextProject = getNextCaseStudyHomeCard("/projects/nutrilucent");

  return (
    <>
      <div className="min-h-screen min-w-0">
        <div className="w-full min-w-0 px-6 md:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="w-full min-w-0 flex flex-col pt-0 pb-4 md:pt-0 md:pb-4 lg:pt-0 lg:pb-4 px-0 lg:px-4 bg-transparent">
              <ProjectHero
                title="A unified system for modern nutrition solutions"
                subtitle="Nutrilucent integrates product systems, brand identity, and digital experience through clear structure and thoughtful design."
                tags={[
                  "Ecommerce",
                  "Website",
                  "Brand",
                  "Product Strategy",
                  "UX Design",
                  "Design System",
                ]}
              />

              <div className="grid grid-cols-12 gap-4 pb-0 md:pb-4">
                <div className="col-span-12">
                  <div className="h-[520px] overflow-hidden rounded-2xl">
                    <ActionAreaCard thumbnail={image_hero} thumbHeight={"520"} />
                  </div>
                </div>
              </div>

              <ProjectOverview
                situation="Nutrilucent needed to launch an emerging digital wellness brand from the ground up, requiring a cohesive product narrative and system design to anchor its ecosystem. The primary challenge was establishing core interface patterns and visual trust for early users before scaling the product line."
                task="As a Product Designer, my mandate was to establish the comprehensive interface direction, brand foundations, and design system patterns. I owned the user experience strategy, translation of health metrics, and layout guidelines for the digital touchpoints."
                action="Executed user discovery research, stakeholder interviews, and competitive audits to align user needs with business priorities. From these insights, I engineered the high-contrast typography system, modular telemetry grid layouts, and physical packaging concepts."
                result="The foundational design system accelerated product iteration speeds and established a highly credible web presence. The unified experience drove a measurable increase in early digital user engagement and supported successful sales performance for the product launch."
              />

              <ProjectSectionHeader
                title="Discovery"
                intro="Conducted research to understand user needs for the wellness landscape. These insights shaped the foundation for Nutrilucent’s emerging identity."
                className="mt-4 md:mt-4"
              />

              <div className="grid grid-cols-12 gap-4 mt-4 md:mt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Research plan</h3>
                  <p className="text-body1 text-foreground">
                    Outlined a focused discovery process grounding the CBGenius to
                    Nutrilucent design migration in real user needs. Through interviews,
                    personas, journey mapping, competitive analysis, and design goals, it
                    builds a clear foundation for aligning the experience with business
                    priorities.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/nutrilucent-researchplan.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent research plan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                  <img
                    src="/images/nutrilucent-stakeint.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent stakeholder interview"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                  <h3 className="text-h3 text-foreground mb-4">Stakeholder interview</h3>
                  <p className="text-body1 text-foreground">
                    Clarified core business goals, target audiences, and the strategic
                    challenges shaping the design. Surfaced priorities around modernizing the
                    site, integrating AI support, strengthening credibility, and positioning
                    Nutrilucent as the hero product, creating a clear baseline for UX direction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Insights matrix</h3>
                  <p className="text-body1 text-foreground">
                    Synthesized patterns across roles, product strategy, brand, operations, and
                    customer behavior. The work revealed founder‑driven workflows, a scattered
                    product line, compliance‑sensitive messaging, and weak marketing
                    foundations. The insights clarify where the business must focus to stabilize
                    operations and strengthen the brand.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/nutrilucent-stakeobservinsight.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent workshops"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                  <img
                    src="/images/nutrilucent-empathymap.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent empathy map"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                  <h3 className="text-h3 text-foreground mb-4">Empathy map</h3>
                  <p className="text-body1 text-foreground">
                    The founder is weighed down by an outdated site, compliance issues, and limited
                    resources. Thinking about regulatory constraints and the need for education.
                    Acts through hands on but inconsistent marketing and operations. Feels
                    anxious about technical debt and unclear branding, pointing to the need for a
                    simpler platform and clearer direction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Stakeholder interview debrief</h3>
                  <p className="text-body1 text-foreground">
                    Consolidated the findings into a clear narrative of the business direction.
                    Emphasized the priorities ahead by modernizing the digital experience,
                    elevating Chromene, clarifying the Nutrilucent brand, and preparing for
                    expansion beyond CBD. These are the strategic drivers for the next phase of
                    work.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/nutrilucent-stakedebrief.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent stakeholder interview debrief"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                  <img
                    src="/images/nutrilucent-snapshot.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent snapshot"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                  <h3 className="text-h3 text-foreground mb-4">Snapshot</h3>
                  <p className="text-body1 text-foreground">
                    Distilled competitive, persona, and platform research across the CBD space
                    to understand how trust, simplicity, and compliance shape user behavior.
                    Studying leading brands, provisional personas, and industry benchmarks
                    revealed UX opportunities around trust signals, guided product selection, and
                    scalable e-commerce foundations that informed the project’s direction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Competitive audit</h3>
                  <p className="text-body1 text-foreground">
                    A deeper dive evaluating five leading CBD brands across key UX categories to
                    identify strengths and gaps. Scoring 100+ features revealed consistent
                    weaknesses in accessibility, personalization, trust signals, and compliance,
                    highlighting clear opportunities to differentiate and guide Nutrilucent’s UX
                    direction.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/nutrilucent-compaudit.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent competitive audit"
                  />
                </div>
              </div>

              <ProjectSectionHeader
                title="Branding"
                intro="The Nutrilucent brand system is in an active development phase, establishing a modern, credible, and scalable identity that can extend seamlessly across every touchpoint."
                className="mt-4 md:mt-4"
              />

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Brand audit</h3>
                  <p className="text-body1 text-foreground">
                    I reviewed leading wellness and supplement brands to understand how they
                    communicate value and build trust. This revealed visual patterns, credibility
                    cues, and opportunities for stronger differentiation.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/nutrilucent-brandaudit.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent brand audit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4 md:mt-[128px] pt-0">
                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                  <h3 className="text-h3 text-foreground mb-4">Inspiration</h3>
                  <p className="text-body1 text-foreground">
                    I explored visual themes from science, wellness, and technology to shape a
                    brand language that feels energetic, intelligent, and future-focused. This
                    illustration represents the inner structure of a mitochondrion, reflecting one
                    of the core wellness benefits of Nutrilucent gummies.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                  <img
                    src="/images/nutrilucent-logoinspiration.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent logo inspiration"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4 md:mt-[128px]">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Sketching</h3>
                  <p className="text-body1 text-foreground">
                    Early sketches translate ideas of energy and cellular vitality into structural
                    motifs that will shape the visual direction of the Mark and Logotype moving forward.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/nutrilucent-logosketch.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent logo sketching"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4 md:mt-[128px] pt-0">
                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                  <h3 className="text-h3 text-foreground mb-4">Packaging</h3>
                  <p className="text-body1 text-foreground">
                    This packaging concept emphasizes clarity and trust through strong hierarchy,
                    bold color, and clear benefit communication. It scales easily across product
                    lines while maintaining a unified brand presence.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                  <img
                    src="/images/nutrilucent-packaging.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Nutrilucent packaging"
                  />
                </div>
              </div>

              <div className="hidden" aria-hidden>
                <ProjectSectionHeader
                  title="Product features"
                  intro="Placeholder feature narrative for Nutrilucent—replace with product-specific highlights when content and imagery are ready."
                  className="mt-4 md:mt-[128px]"
                />

                <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                  <div className="col-span-12 text-left min-w-0 mb-4">
                    <h3 className="text-h3 text-foreground mb-4">Today</h3>
                    <p className="text-body1 text-foreground w-full lg:w-1/2">
                      Placeholder section—replace with Nutrilucent feature copy and imagery
                      (e.g. hero campaign, daily digest, or retail moment).
                    </p>
                  </div>

                  <div className="col-span-12">
                    <img
                      src="/images/glorifi-today.png"
                      className="w-full h-auto rounded-2xl object-contain"
                      alt="Nutrilucent feature"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                  <div className="col-span-12 text-left min-w-0 mb-4">
                    <h3 className="text-h3 text-foreground mb-4">Snapshot</h3>
                    <p className="text-body1 text-foreground w-full lg:w-1/2">
                      Placeholder section—replace with Nutrilucent dashboard or summary
                      experience description.
                    </p>
                  </div>

                  <div className="col-span-12">
                    <img
                      src="/images/glorifi-snapshot.png"
                      className="w-full h-auto rounded-2xl object-contain"
                      alt="Nutrilucent feature"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                  <div className="col-span-12 text-left min-w-0 mb-4">
                    <h3 className="text-h3 text-foreground mb-4">Rewards</h3>
                    <p className="text-body1 text-foreground w-full lg:w-1/2">
                      Placeholder section—replace with loyalty, community, or partner program
                      story for Nutrilucent.
                    </p>
                  </div>

                  <div className="col-span-12">
                    <img
                      src="/images/glorifi-rewards.png"
                      className="w-full h-auto rounded-2xl object-contain"
                      alt="Nutrilucent feature"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                  <div className="col-span-12 text-left min-w-0 mb-4">
                    <h3 className="text-h3 text-foreground mb-4">Accounts</h3>
                    <p className="text-body1 text-foreground w-full lg:w-1/2">
                      Placeholder section—replace with account, subscription, or commerce
                      flow narrative for Nutrilucent.
                    </p>
                  </div>

                  <div className="col-span-12">
                    <img
                      src="/images/glorifi-accounts.png"
                      className="w-full h-auto rounded-2xl object-contain"
                      alt="Nutrilucent feature"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4 md:mt-[128px]">
                <div className="col-span-12 lg:col-span-5 pb-0">
                  <div className="w-full">
                    <h2 className="text-h2 text-foreground mb-4">Next project</h2>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-7 pb-0 min-w-0">
                  {nextProject ? <ProjectCard {...nextProject} layout="vertical" /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
