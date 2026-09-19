"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function HeroSection() {
  return (
    <section className="hero w-full min-w-0 pt-4 pb-4 md:pt-9 md:pb-9 lg:pt-4 lg:pb-0 bg-transparent">
      <div className="content w-full min-w-0 px-6 md:px-8">
        <div className="mx-auto w-full max-w-[1400px]">

          {/* OUTER BOX */}
          <div className="w-full min-w-0 flex flex-col py-4 md:py-4 lg:py-4 px-0 lg:px-4 bg-transparent">

            {/* Tablet uses a tighter gutter; desktop restores the full visual gap */}
            <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:items-stretch md:gap-4 lg:gap-24">
              <div className="min-w-0 flex-1 basis-0 md:min-w-[20rem] text-foreground bg-transparent">
                <h1 className="text-h1 font-light whitespace-nowrap">
                  Mike Marchitto
                </h1>
                <h4 className="text-h4 !font-medium text-foreground mt-[0px]">
                  Product Designer Building Modern AI‑Powered Digital Experiences
                </h4>
                
                {/* Tactical Value Propositions List */}
                <div className="mt-3.5 flex flex-col gap-2.75 max-w-xl text-left">
                  <p className="text-body1 text-foreground leading-relaxed">
                    Simplify complex workflows so users can move faster with less friction and greater clarity.
                  </p>
                  <p className="text-body1 text-foreground leading-relaxed">
                    Build scalable design systems that maintain consistency and enable teams to ship cleanly across products.
                  </p>
                  <p className="text-body1 text-foreground leading-relaxed">
                    Accelerate delivery with AI‑augmented research, information architecture, rapid prototyping and automation.
                  </p>
                </div>

              </div>

              {/* Image: 50% of row; min-w-0 + shrink-0 keeps layout stable without overlapping text */}
              <div className="flex min-w-0 w-full shrink-0 flex-col gap-0 bg-transparent md:w-[50%]">
                <Card className="flex min-w-0 w-full flex-col gap-0 border-0 bg-transparent p-0 shadow-none">
                  <div className="w-full min-w-0 overflow-hidden rounded-2xl bg-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/mike-head.png"
                      alt="Mike profile"
                      width={1200}
                      height={878}
                      className="block h-auto w-full max-w-full object-cover rounded-2xl"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                    />
                  </div>
                  <CardContent className="hidden p-0" aria-hidden="true">
                    <blockquote className="profile-quote text-body2 text-foreground font-light text-center m-0 p-0 mb-4">
                      <p className="italic text-foreground [font-size:var(--text-body2-size)] [line-height:24px]">
                        "A king is a man who turns hope into action."
                      </p>
                      <cite className="not-italic block text-foreground [font-size:var(--text-body2-size)] [line-height:24px]">
                        — Ralph Waldo Emerson
                      </cite>
                    </blockquote>
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