"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const footerNavButtonClass =
  "nav-button h-auto min-h-0 justify-start rounded-none bg-transparent border-0 px-0 py-0 shadow-none hover:bg-transparent hover:opacity-70 dark:hover:bg-transparent color:hover:bg-transparent";

export default function Footer() {
  const { resolvedTheme } = useTheme();

  return (
    <footer className="text-foreground w-full">
      {/* 1. SECTION — full bleed */}
      <section className="w-full pt-2 pb-6 md:py-9 lg:pt-0 lg:pb-12 bg-transparent">
        {/* 2. GUTTER */}
        <div className="w-full px-4 md:px-8 lg:px-16">
          {/* 3. MAX-WIDTH */}
          <div className="max-w-[1328px] mx-auto">
            {/* 4. CONTENT WRAPPER — 64px padding, visible band */}
            <div className="w-full min-w-0 flex flex-col py-4 md:py-8 lg:py-16 px-0 lg:px-16 bg-transparent">
              <div className="w-full bg-transparent pt-6 pb-2 md:pt-10 md:pb-6 lg:pt-0 lg:pb-12">
                <div className="w-full min-w-0 text-left flex flex-col">
                  <div className="w-fit p-0 m-0">
                    <h3 className="p-0 m-0">
                      <img
                        src="/images/auditflow-logo.svg"
                        alt="AuditFlow"
                        className="h-6 w-auto dark:[filter:invert(1)] color:[filter:invert(1)]"
                      />
                    </h3>
                  </div>
                  <div className="max-w-[576px] p-0 m-0 mt-4">
                    <h5 className="text-h5 max-w-[576px] text-foreground p-0 m-0">
                      Compliance made simple.
                    </h5>
                  </div>
                </div>
              </div>

              <div className="w-full bg-transparent pt-0 pb-4 md:pt-4 md:pb-8 lg:pt-8 lg:pb-12">
                <div className="w-full flex flex-col sm:flex-row justify-between items-end gap-4">
                  <nav
                    className="hidden lg:flex flex-row flex-wrap items-center gap-8"
                    aria-label="Footer"
                  >
                    <Button
                      className={footerNavButtonClass}
                      variant="ghost"
                      size="lg"
                      asChild
                    >
                      <Link href="/" className="text-button">
                        Clauses
                      </Link>
                    </Button>

                    <Button
                      className={footerNavButtonClass}
                      variant="ghost"
                      size="lg"
                      asChild
                    >
                      <Link href="/reports" className="text-button">
                        Reports
                      </Link>
                    </Button>

                    <Button
                      className={footerNavButtonClass}
                      variant="ghost"
                      size="lg"
                      asChild
                    >
                      <Link href="/help" className="text-button">
                        Help
                      </Link>
                    </Button>

                    <Button
                      className={footerNavButtonClass}
                      variant="ghost"
                      size="lg"
                      asChild
                    >
                      <a
                        href="mailto:mikemarchitto@gmail.com?subject=AuditFlow%20support"
                        className="text-button"
                      >
                        Support
                      </a>
                    </Button>
                  </nav>
                  <img
                    suppressHydrationWarning
                    src={
                      resolvedTheme === "light"
                        ? "/images/crown-black.svg"
                        : "/images/crown-white.svg"
                    }
                    alt="Crown Works"
                    className="hidden h-[76px] w-auto shrink-0 object-contain object-right translate-y-[6px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
