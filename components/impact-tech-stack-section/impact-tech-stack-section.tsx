"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCounter } from "@/components/stat-counter/stat-counter";
import { useScrollTriggerOnce } from "@/components/stat-counter/use-scroll-trigger-once";
import { cn } from "@/lib/utils";

const metrics = [
  { value: "10", label: "Years" },
  { value: "7", label: "Products" },
  { value: "60", label: "Testings" },
  { value: "4", label: "AI Labs" },
];

/** Full tech stack grid — Impact Stats and Tech Stack section only */
function ImpactStatsTechStackLogos() {
  return (
    <>
      {/* Row 1: Figma, Cursor, OpenAI */}
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-figma.svg"
          alt="Figma"
          className="w-full max-w-[89px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-cursor.svg"
          alt="Cursor"
          className="w-full max-w-[96px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-openai.svg"
          alt="OpenAI"
          className="w-full max-w-[91px] h-auto object-contain object-center shrink-0"
        />
      </div>

      {/* Row 2: Webflow, Next.js, Claude */}
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-webflow.svg"
          alt="Webflow"
          className="w-full max-w-[111px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-next.svg"
          alt="Next.js"
          className="w-full max-w-[80px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-claude.svg"
          alt="Claude"
          className="w-[96px] h-auto object-contain object-center shrink-0"
        />
      </div>

      {/* Row 3: Shopify, Framer, Adobe */}
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-shopify.svg"
          alt="Shopify"
          className="w-full max-w-[93px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-framer.svg"
          alt="Framer"
          className="w-full max-w-[93px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-adobe.svg"
          alt="Adobe"
          className="w-full max-w-[62px] h-auto object-contain object-center shrink-0"
        />
      </div>

      {/* Row 4: n8n, GitHub, Vercel */}
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-n8n.svg"
          alt="n8n"
          className="w-full max-w-[91px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-github.svg"
          alt="GitHub"
          className="w-full max-w-[90px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/images/logo-vercel.svg"
          alt="Vercel"
          className="w-full max-w-[86px] h-auto object-contain object-center shrink-0"
        />
      </div>

      {/* Row 5: Material, Fluent, Tailwind */}
      <div className="flex h-full w-full items-center justify-center gap-x-[16px]">
        <img
          src="/images/logo-material.svg"
          alt="Material"
          className="w-full max-w-[27px] h-auto object-contain object-center shrink-0"
        />
        <img
          src="/images/logo-notion.svg"
          alt="Notion"
          className="w-full max-w-[24px] h-auto object-contain object-center shrink-0"
        />
        <img
          src="/images/logo-tailwindcss.svg"
          alt="Tailwind CSS"
          className="w-full max-w-[29px] h-auto object-contain object-center shrink-0"
        />
      </div>

      {/* Row 6: React, TypeScript, Shadcn */}
      <div className="flex h-full w-full items-center justify-center gap-x-[16px]">
        <img
          src="/images/logo-react.svg"
          alt="React"
          className="w-full max-w-[30px] h-auto object-contain object-center shrink-0"
        />
        <img
          src="/images/logo-typescript.svg"
          alt="TypeScript"
          className="w-full max-w-[26px] h-auto object-contain object-center shrink-0"
        />
        <img
          src="/images/logo-shadcn.svg"
          alt="Shadcn UI"
          className="w-full max-w-[23px] h-auto object-contain object-center shrink-0"
        />
      </div>

      {/* Row 7: Ollama, Hugging Face, OpenRouter */}
      <div className="flex h-full w-full items-center justify-center gap-x-[16px]">
        <img
          src="/images/logo-ollama.svg"
          alt="Ollama"
          className="m-0 block w-full max-w-[19px] h-auto object-contain object-center shrink-0 p-0"
        />
        <img
          src="/images/logo-huggingface.svg"
          alt="Hugging Face"
          className="m-0 block w-full max-w-[25px] h-auto object-contain object-center shrink-0 p-0"
        />
        <img
          src="/images/logo-openrouter.svg"
          alt="OpenRouter"
          className="m-0 block w-full max-w-[21px] h-auto object-contain object-center shrink-0 p-0"
        />
      </div>
    </>
  );
}

/** Slim grid + centered layout — Companies section only */
function CompaniesTechStackLogos() {
  const cell =
    "flex w-full min-h-[56px] md:min-h-[72px] lg:min-h-[80px] items-center justify-center";

  return (
    <>
      <div className={cell}>
        <img
          src="/images/logo-starbucks.png"
          alt="Starbucks"
          className="max-h-[104px] md:max-h-[120px] lg:max-h-[128px] w-full max-w-[197px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className={cell}>
        <img
          src="/images/logo-microsoft.png"
          alt="Microsoft"
          className="max-h-[104px] md:max-h-[120px] lg:max-h-[128px] w-full max-w-[172px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className={cell}>
        <img
          src="/images/logo-eddiebauer.png"
          alt="Eddie Bauer"
          className="max-h-[104px] md:max-h-[120px] lg:max-h-[128px] w-full max-w-[211px] h-auto object-contain object-center shrink-0"
        />
      </div>

      <div className={cell}>
        <img
          src="/images/logo-morningstar.png"
          alt="Morningstar"
          className="w-full max-w-[191px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className={cell}>
        <img
          src="/images/logo-siff.png"
          alt="SIFF"
          className="w-full max-w-[212px] h-auto object-contain object-center shrink-0"
        />
      </div>
      <div className={cell}>
        <img
          src="/images/logo-fermilab.png"
          alt="Fermilab"
          className="w-[180px] h-auto object-contain object-center shrink-0"
        />
      </div>
    </>
  );
}

type ImpactTechStackSectionProps = {
  title?: string;
  /** When true, hides the stat counters and expands the logo grid to full width (e.g. Companies). */
  hideStats?: boolean;
};

export default function ImpactTechStackSection({
  title = "Impact stats and tech stack",
  hideStats = false,
}: ImpactTechStackSectionProps) {
  const { ref: statsTriggerRef, triggered: statsTriggered } =
    useScrollTriggerOnce();

  return (
    <section
      className="w-full min-w-0 min-h-0 py-4 md:py-4 lg:pt-4 lg:pb-0 bg-transparent"
    >
      <div className="w-full min-w-0 px-6 md:px-8">
        <div className="mx-auto w-full max-w-[1400px] min-h-0">
          <div className="w-full mb-0 py-4 px-0 lg:px-4 lg:pb-0 bg-transparent">
            <h2 className="text-h2 font-light text-left text-foreground">
              {title}
            </h2>
          </div>

          <div className="w-full min-w-0 flex flex-col py-4 md:py-4 lg:py-4 px-0 lg:px-4 bg-transparent">
            <div
              className={cn(
                "w-full grid gap-4",
                hideStats
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2 md:items-stretch md:min-h-[426px]"
              )}
            >
              {/* Metrics */}
              {!hideStats && (
                <div className="p-0 flex flex-col min-h-0 h-full min-w-0 bg-transparent">
                  <Card className="border-0 shadow-none bg-transparent p-0 gap-0 w-full h-full min-h-0 flex flex-col">
                    <CardContent className="p-0 flex flex-col min-h-0 flex-1 overflow-hidden">
                      <div
                        ref={statsTriggerRef}
                        className="numbers-anchor p-0 w-full flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <div className="grid grid-cols-2 grid-rows-[1fr_1fr] gap-4 min-w-0 items-stretch flex-1 min-h-0">
                          {metrics.map((metric, i) => (
                            <StatCounter
                              key={i}
                              value={Number(metric.value)}
                              label={metric.label}
                              startAnimation={statsTriggered}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tech Stack */}
              <div
                className={cn(
                  "p-0 flex flex-col min-h-0 w-full min-w-0",
                  hideStats && "h-full self-stretch",
                  !hideStats && "h-full min-h-0"
                )}
              >
                <Card
                  className={cn(
                    "rounded-2xl w-full min-w-0 flex flex-col bg-[oklch(100%_0_0)] border-0 gap-0",
                    hideStats
                      ? "py-4 px-4 md:py-4 md:px-4 lg:py-4 lg:px-4 min-h-0 md:min-h-[426px] flex-1"
                      : "h-full min-h-0 py-[34px] px-4 md:py-[26px] md:px-4 lg:py-[44px] lg:px-4 flex-1"
                  )}
                >
                  <CardContent
                    className={cn(
                      "p-0 w-full",
                      hideStats && "flex flex-1 flex-col justify-center min-h-0",
                      !hideStats && "flex flex-1 flex-col justify-center min-h-0"
                    )}
                  >
                    <div
                      className={cn(
                        "logo-columns-grid grid w-full min-w-0",
                        hideStats
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(56px,_auto)] md:auto-rows-[minmax(72px,_auto)] lg:auto-rows-[minmax(80px,_auto)] content-center max-w-none items-center justify-items-center gap-x-4 gap-y-[23px] md:gap-x-14 md:gap-y-[47px] lg:gap-x-4 lg:gap-y-[87px]"
                          : "grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(36px,_auto)] md:auto-rows-[minmax(38px,_auto)] lg:auto-rows-[minmax(40px,_auto)] content-center max-w-xl lg:max-w-4xl mx-auto items-center gap-x-2 gap-y-[33px] md:gap-x-3 md:gap-y-[27px] lg:gap-x-4 lg:gap-y-[35px]"
                      )}
                    >
                      {hideStats ? (
                        <CompaniesTechStackLogos />
                      ) : (
                        <ImpactStatsTechStackLogos />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
