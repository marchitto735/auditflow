"use client";

import ActionAreaCard from "@/components/project-three/ActionAreaCard";
import ProjectCard from "@/components/project-card/project-card";
import ProjectHero from "@/components/project-hero/project-hero";
import ProjectOverview from "@/components/project-overview/project-overview";
import ProjectSectionHeader from "@/components/project-section-header/project-section-header";
import { getNextCaseStudyHomeCard } from "@/lib/portfolio-projects";

import "../../styles/App.css";

const image_hero = "/images/eddiebauer-hero.png";
const image_workshops = "/images/eddiebauer-workshops.png";
const image_compaudit = "/images/eddiebauer-competitiveaudit.png";
const image_wireframe = "/images/eddiebauer_wireframeflows.png";
const image_designsystem = "/images/eddiebauer-designsystem.png";
const image_uiexplore = "/images/eddiebauer-uiexploration.png";
const image_systemicons = "/images/eddiebauer-systemiconography.png";
const image_productdetails = "/images/eddiebauer-productdetails.png";

function Work() {
    const nextProject = getNextCaseStudyHomeCard("/projects/eddiebauer");

    return (
        <>
        <div className="w-full min-w-0 px-6 md:px-8">
        <div className="mx-auto w-full max-w-[1400px]">
        <div className="w-full min-w-0 flex flex-col pt-0 pb-4 md:pt-0 md:pb-4 lg:pt-0 lg:pb-4 px-0 lg:px-4 bg-transparent">

            <ProjectHero
              title="An ecommerce experience to modernize the brand"
              subtitle="The Eddie Bauer Ecommerce platform design enhances product discovery, strengthens brand identity, and improves the overall shopping experience."
              tags={[
                "Ecommerce",
                "Website",
                "Cross Platform",
                "Product Strategy",
                "UX Design",
                "Design System",
              ]}
            />

            <div className="grid grid-cols-12 gap-4 pb-0 md:pb-[80px]">

                <div className="col-span-12">
                    <div className="h-[520px] rounded-2xl overflow-hidden">
                        <ActionAreaCard
                            thumbnail={image_hero}
                            thumbHeight={"520"}
                        // name={'GloriFi'}
                        // descriptions={'GloriFi is a fintech startup offering banking and credit cards with a focus on financial wellness information via their mobile and web application.'}
                        // route={'/designSystem'} 
                        />
                    </div>
                </div>


            </div>



            <ProjectOverview
              situation="Eddie Bauer needed to modernize its digital retail ecosystem to address outdated user patterns and fragmented visual systems. The legacy interface created friction along the product journey, directly impacting digital marketing conversion velocity and long-term customer engagement."
              task="As a Product Designer, my mandate was to engineer a responsive, contemporary e-commerce interface while safeguarding core brand trust. I owned the strategic redesign of the core Product Description Page (PDP) architecture, cross-platform navigation schemas, and the overarching design system framework."
              action="Executed user discovery research, competitive retail audits, and stakeholder alignment workshops to map existing user experience gaps. From these insights, I structured the refined information architecture, engineered responsive mid-fidelity wireframes, and produced a custom-icon design system to streamline the buying funnel."
              result="The redesigned responsive experience accelerated task completion speeds and drove a measurable decrease in critical PDP checkout drop-off rates. Additionally, the unified design system component library successfully optimized internal product shipping velocity, drastically reducing cross-functional design and engineering development time."
            />







            <ProjectSectionHeader
              title="Discovery"
              intro="I analyzed customer behavior, ecommerce patterns, and outdoor retail trends to identify opportunities for a more engaging and conversion‑friendly experience."
              className="mt-4 md:mt-4"
            />


            <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                    <h3 className="text-h3 text-foreground mb-4">Competitive audit</h3>
                    <p className="text-body1 text-foreground">
                    In order to gain a deeper understanding for designs in the context of outdoor clothing websites, I conducted an audit and examined patterns and strategies to engage customers.
                    </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                    <img src={image_compaudit} className="w-full h-auto rounded-2xl object-contain" alt="Competitive audit" />
                </div>
            </div>


            <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                    <img src={image_workshops} className="w-full h-auto rounded-2xl object-contain" alt="Workshops" />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                    <h3 className="text-h3 text-foreground mb-4">Workshops</h3>
                    <p className="text-body1 text-foreground">
                    Facilitated a series of cross-functional workshops guiding teams through pattern reviews, content evaluation, and usability discussions to uncover opportunities for a more cohesive and intuitive product experience.
                    </p>
                </div>
            </div>



            <ProjectSectionHeader
              title="Information architecture"
              intro="I refined the site structure and product hierarchy to make browsing easier and ensure customers could quickly find relevant gear and apparel."
              className="mt-4 md:mt-[128px]"
            />

            <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                    <h3 className="text-h3 text-foreground mb-4">Wireframe flows</h3>
                    <p className="text-body1 text-foreground">
                    I created wireframes with the aim of gaining valuable insight into the user experience of customers and to identify any areas that required improvement.
                    </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                    <img src={image_wireframe} className="w-full h-auto rounded-2xl object-contain" alt="Wireframe flows" />
                </div>
            </div>


            <ProjectSectionHeader
              title="Visual design"
              intro="I developed updated visual styles and UI components that modernized the brand while maintaining its heritage and outdoor identity."
              className="mt-4 md:mt-[128px]"
            />

            <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 sm:col-span-4 md:col-span-4">
                    <h3 className="text-h3 text-foreground mb-4">UI exploration</h3>
                    <p className="text-body1 text-foreground">
                    Key components were designed utilizing the design system to bring wireframes to life. This ensured mockups were visually cohesive and aligned with the brand’s values and aesthetic.
                    </p>
                </div>

                <div className="col-span-12 sm:col-span-8 md:col-span-8">
                    <img src={image_uiexplore} className="w-full h-auto rounded-2xl object-contain" alt="UI exploration" />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-4 md:mt-[128px] pt-0">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-1">
                    <img src={image_systemicons} className="w-full h-auto rounded-2xl object-contain" alt="System icons" />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-2">
                    <h3 className="text-h3 text-foreground mb-4">System icons</h3>
                    <p className="text-body1 text-foreground">
                    Crafting a custom system icon library strengthened the brand’s visual language, ensured consistent interaction patterns across the product, and provided development with a unified, scalable asset package that supports a clear and intuitive user experience.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-4 md:mt-[128px] pt-0">
                <div className="col-span-12 sm:col-span-8 md:col-span-8 order-2 sm:order-2">
                    <img
                      src={image_designsystem}
                      className="w-full h-auto rounded-2xl object-contain"
                      alt="Design system"
                    />
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-4 order-1 sm:order-1">
                    <h3 className="text-h3 text-foreground mb-4">Design system</h3>
                    <p className="text-body1 text-foreground">
                    To maintain a consistent user experience, styles and UI components were established and documented for seamless handoff to development, resulting in a polished and cohesive interface.
                    </p>
                </div>
            </div>


            <ProjectSectionHeader
              title="Product shipped"
              intro="The final experience delivered a cleaner, more cohesive ecommerce platform with reusable components that support ongoing marketing and merchandising needs."
              className="mt-4 md:mt-[128px]"
            />


            <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">
                <div className="col-span-12 lg:col-span-6 text-left min-w-0">
                    <h3 className="text-h3 text-foreground mb-0">Product details</h3>
                    <p className="text-body1 text-foreground mt-4 mb-4">
                      The product details page now has a modern and minimalistic design giving a sophisticated impression. The search function helps users navigate reviews and questions, boosting customer confidence in purchasing decisions.
                    </p>
                </div>

                <div className="col-span-12">
                    <img src={image_productdetails} className="w-full rounded-2xl" width={"100%"} height={"100%"} alt="Large Pizza" />
                </div>
            </div>



            <div className="grid grid-cols-12 gap-4 pt-4 md:pt-[128px]">

                <div className="col-span-12 lg:col-span-5">
                    <div className="w-full">
                        <h2 className="text-h2 text-foreground mb-4">Next project</h2>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 min-w-0">
                    <div className="w-full min-w-0">
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

export default Work;
