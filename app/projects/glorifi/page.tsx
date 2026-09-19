"use client";

import ActionAreaCard from "@/components/project-three/ActionAreaCard";
import ProjectCard from "@/components/project-card/project-card";
import ProjectHero from "@/components/project-hero/project-hero";
import ProjectOverview from "@/components/project-overview/project-overview";
import ProjectSectionHeader from "@/components/project-section-header/project-section-header";
import { getNextCaseStudyHomeCard } from "@/lib/portfolio-projects";

const image_hero = "/images/glorifi-hero.png";
const image_compaudit = "/assets/project_one/glorifi_compaudit.png";
const image_designsystem = "/assets/project_one/glorifi_designsystem.png";
const image_personas = "/assets/project_one/glorifi_personas.png";
const image_uiexplore = "/assets/project_one/glorifi_uiexplore.png";
const image_wireframe = "/assets/project_one/glorifi_wireframe.png";
const image_today = "/assets/project_one/glorifi_today.png";
const image_snapshot = "/assets/project_one/glorifi_snapshot.png";
const image_rewards = "/assets/project_one/glorifi_rewards.png";
const image_accounts = "/assets/project_one/glorifi_accounts.png";

export default function Work() {
  const nextProject = getNextCaseStudyHomeCard("/projects/glorifi");

  return (
    <>
      <div className="min-h-screen min-w-0">
        <div className="w-full min-w-0 px-6 md:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="w-full min-w-0 flex flex-col pt-0 pb-4 md:pt-0 md:pb-4 lg:pt-0 lg:pb-4 px-0 lg:px-4 bg-transparent">
              <ProjectHero
                title="A financial wellness platform to simplify banking"
                subtitle="GloriFi is a unified experience that blends financial education, real‑time insights, and secure account management into a modern, intuitive interface."
                tags={[
                  "Fintech",
                  "Mobile App",
                  "Website",
                  "Product Strategy",
                  "UX Design",
                  "Design System",
                ]}
              />

              <div className="grid grid-cols-12 gap-4 pb-0 md:pb-4">
                <div className="col-span-12">
                  <div className="h-[504px] overflow-hidden rounded-2xl">
                    <ActionAreaCard thumbnail={image_hero} thumbHeight={"520"} />
                  </div>
                </div>
              </div>

              <ProjectOverview
                situation="GloriFi set out to build a unified financial wellness platform across mobile and web, with an eight‑month deadline to deliver an MVP and beta that could validate market demand and support future funding."
                task="As a Product Designer, my explicit mandate was to architect the end-to-end user experience and design system for the core mobile banking platform. I owned the comprehensive design strategy for the snapshot, the real-time data insights hub, Rewards and Account flows."
                action="Led qualitative user research and competitive audits to establish trust, mapped the complex cross‑platform information architecture, and built a scalable UI component system that unified our web and mobile frameworks."
                result="Following the initial release, the design framework successfully supported scaling the application to over 40,000 active individual downloads during the launch phase. This user adoption secured an 11th-place ranking among all financial applications on the market."
              />

              <ProjectSectionHeader
                title="Discovery"
                intro="Conducted a series of qualitative and competitive research activities to understand user expectations around financial literacy, mobile banking, and trust‑building patterns."
                className="mt-4 md:mt-4"
              />

              <div className="grid grid-cols-12 gap-4 mt-4 md:mt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Competitive audit</h3>
                  <p className="text-body1 text-foreground">
                    Reviewed several banking and financial apps, evaluating
                    their features and identifying areas for improvement. This helped me
                    gain a comprehensive understanding of the app landscape.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/glorifi-competitiveaudit.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Personas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                  <img
                    src="/images/glorifi-workshops.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Workshop synthesis"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                  <h3 className="text-h3 text-foreground mb-4">Workshops</h3>
                  <p className="text-body1 text-foreground">
                    Facilitated empathy‑mapping workshops to uncover user motivations and
                    behaviors, informing personas that highlighted opportunity areas and
                    guided experience improvements.
                  </p>
                </div>
              </div>

              <ProjectSectionHeader
              title="Information architecture"
                intro="Mapped the core navigation, content hierarchy, and user flows to ensure the experience remained intuitive, predictable, and aligned with user mental models."
                className="mt-4 md:mt-[128px]"
              />

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">Wireframe flows</h3>
                  <p className="text-body1 text-foreground">
                    Created user flows and wireframes, examining the design process
                    and identifying areas for improvement. We discussed potential
                    issues and brainstormed solutions to ensure a seamless and
                    user-friendly experience.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/glorifi-wireframeflows.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Wireframes"
                  />
                </div>
              </div>

              <ProjectSectionHeader
              title="Visual design"
                intro="UI exploration established the foundation for a scalable design system that unified typography, color, spacing, and component patterns across mobile and web."
                className="mt-4 md:mt-4"
              />

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                  <h3 className="text-h3 text-foreground mb-4">UI exploration</h3>
                  <p className="text-body1 text-foreground">
                    Applied brand styles across early layouts and interaction patterns to
                    establish a consistent visual direction. This work created the
                    foundation for mockups that were both effective and aligned with our
                    guidelines and design principles.
                  </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                  <img
                    src="/images/glorifi-uiexploration.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="UI explorations"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4 md:mt-[128px] pt-0">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                  <img
                    src="/images/glorifi-designsystem.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Design system"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                  <h3 className="text-h3 text-foreground mb-4">Design system</h3>
                  <p className="text-body1 text-foreground">
                    This UI framework saved time and effort for the team by providing
                    pre-built components and promoting best UI practices. The framework
                    also allowed for easier maintenance and updates without compromising
                    the site's integrity.
                  </p>
                </div>
              </div>

              <ProjectSectionHeader
              title="Product shipped"
                intro="The final product delivered a cohesive financial experience that combined news, insights, rewards, and account management into a polished, user‑friendly interface."
                className="mt-4 md:mt-[128px]"
              />

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-4">
                <div className="col-span-12 text-left min-w-0 mb-4">
                  <h3 className="text-h3 text-foreground mb-4">Today</h3>
                  <p className="text-body1 text-foreground w-full lg:w-1/2">
                    This news feed presents global and financial news with a TikTok-style
                    swipe interface. It's easy to browse and visually engaging for both
                    casual readers and investors who want to stay informed.
                  </p>
                </div>

                <div className="col-span-12">
                  <img
                    src="/images/glorifi-today.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Today feature"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 text-left min-w-0 mb-4">
                  <h3 className="text-h3 text-foreground mb-4">Snapshot</h3>
                  <p className="text-body1 text-foreground w-full lg:w-1/2">
                    This dashboard helps you view income, expenses, investments, and
                    debts. You can monitor progress, identify improvement areas, and
                    make informed decisions.
                  </p>
                </div>

                <div className="col-span-12">
                  <img
                    src="/images/glorifi-snapshot.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Snapshot feature"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 text-left min-w-0 mb-4">
                  <h3 className="text-h3 text-foreground mb-4">Rewards</h3>
                  <p className="text-body1 text-foreground w-full lg:w-1/2">
                    Redesigned and reskinned the vendor loyalty feature so users get
                    rewards and discounts from their favorite service providers.
                  </p>
                </div>

                <div className="col-span-12">
                  <img
                    src="/images/glorifi-rewards.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Rewards feature"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 text-left min-w-0 mb-4">
                  <h3 className="text-h3 text-foreground mb-4">Accounts</h3>
                  <p className="text-body1 text-foreground w-full lg:w-1/2">
                    Reusable marketing cards and user flow screens simplify banking
                    account opening. This approach helps users select the right account
                    and quickly complete the task.
                  </p>
                </div>

                <div className="col-span-12">
                  <img
                    src="/images/glorifi-accounts.png"
                    className="w-full h-auto rounded-2xl object-contain"
                    alt="Accounts feature"
                  />
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
