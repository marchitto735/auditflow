"use client";

import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import Script from "next/script";
import type { OpenAIChatKit, ThemeOption } from "@openai/chatkit";
import {
  ChatKit,
  useChatKit,
  type ChatKitControl,
  type UseChatKitOptions,
} from "@openai/chatkit-react";

import { Button } from "@/components/ui/button";
import { type Theme, useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

/** Inter inside ChatKit’s iframe (does not inherit `app/layout.tsx` fonts). */
const CHATKIT_INTER_TYPOGRAPHY: NonNullable<ThemeOption["typography"]> = {
  fontFamily: "'Inter', system-ui, sans-serif",
  baseSize: 14,
  fontSources: [
    {
      family: "Inter",
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2",
      weight: "100 900",
      style: "normal",
      display: "swap",
    },
  ],
};

/**
 * ChatKit chrome (greeting, shell inside the iframe). Keep `colorScheme` aligned with the surface
 * pair so text/UI contrast is predictable. Message bubble colors: `globals.css` `--chat-message-*`.
 */
const CHATKIT_SURFACE: Record<
  Theme,
  {
    colorScheme: "light" | "dark";
    background: string;
    foreground: string;
    accentPrimary: string;
  }
> = {
  light: {
    colorScheme: "light",
    background: "#F5F5F5",
    foreground: "#ECECEC",
    accentPrimary: "#000000",
  },
  dark: {
    colorScheme: "dark",
    background: "#14161A",
    foreground: "#222429",
    accentPrimary: "#ffffff",
  },
  color: {
    colorScheme: "dark",
    background: "#13241C",
    foreground: "#36483F",
    accentPrimary: "#ffffff",
  },
};

function chatKitThemeForSiteTheme(theme: Theme): ThemeOption {
  const s = CHATKIT_SURFACE[theme];
  return {
    colorScheme: s.colorScheme,
    density: "compact",
    radius: "soft",
    typography: CHATKIT_INTER_TYPOGRAPHY,
    color: {
      surface: {
        background: s.background,
        foreground: s.foreground,
      },
      accent: { primary: s.accentPrimary, level: 0 },
      grayscale: { hue: 0, tint: 0 },
    },
  };
}

const CHATKIT_THEME_BY_SITE_THEME: Record<Theme, ThemeOption> = {
  light: chatKitThemeForSiteTheme("light"),
  dark: chatKitThemeForSiteTheme("dark"),
  color: chatKitThemeForSiteTheme("color"),
};

const ChatKitControlContext = React.createContext<ChatKitControl | null>(null);

/** Resolved `getComputedStyle` for the chat sheet panel (same utility classes as `SheetContent`). */
const ResolvedChatPanelBgContext = React.createContext<string | null>(null);

export function useChatKitControl(): ChatKitControl {
  const ctx = React.useContext(ChatKitControlContext);
  if (!ctx) {
    throw new Error("useChatKitControl must be used within ChatKitProvider");
  }
  return ctx;
}

/**
 * Same RGB(A) as `SheetContent`: `bg-background color:bg-sidebar-background` (matches chat-panel.tsx).
 * ChatKit `surface.background` + shadow iframe need this — guessed hex/oklch often won’t match pixels.
 */
function useResolvedChatPanelBackground(): string | null {
  const { resolvedTheme } = useTheme();
  const [resolved, setResolved] = React.useState<string | null>(null);

  React.useLayoutEffect(() => {
    if (typeof document === "undefined") return;

    const probe = document.createElement("div");
    probe.className = "bg-background color:bg-sidebar-background";
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;left:-9999px;top:0;width:1px;height:1px;pointer-events:none;opacity:0;";
    document.body.appendChild(probe);

    const bg = getComputedStyle(probe).backgroundColor;
    document.body.removeChild(probe);

    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      setResolved(bg);
    }
  }, [resolvedTheme]);

  return resolved;
}

const CHATKIT_USER_STORAGE_KEY = "portfolio_chatkit_user_id";

function getOrCreateChatKitUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(CHATKIT_USER_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(CHATKIT_USER_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `anon-${crypto.randomUUID()}`;
  }
}

/**
 * If set (e.g. `/api/chat`), ChatKit uses your custom completions URL + domain key (OpenAI Chat Completions + RAG).
 * If unset, ChatKit uses OpenAI-hosted workflow sessions (`OPENAI_API_KEY` + `WORKFLOW_ID` on the server).
 */
function getCustomChatApiUrl(): string {
  return process.env.NEXT_PUBLIC_CHATKIT_CUSTOM_API_URL?.trim() ?? "";
}

function ChatSessionErrorFallback({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-4 flex min-h-[200px] flex-col justify-center gap-4 rounded-2xl border border-destructive/35 bg-destructive/5 px-4 py-4 text-left text-sm text-foreground"
    >
      <p className="font-medium">Chat couldn’t start</p>
      <p className="text-muted-foreground">{message}</p>
      <Button type="button" variant="black" className="w-fit" onClick={onRetry}>
        Try again
      </Button>
      <p className="text-xs text-muted-foreground">
        If this keeps happening on the live site, check deployment env (OpenAI keys, workflow ID) and
        ChatKit domain settings for this origin.
      </p>
    </div>
  );
}

/**
 * ChatKit loads the API URL inside an iframe; relative paths resolve against the iframe origin,
 * not the page. Resolve `/api/chat` to `https://this-site/api/chat` on the client.
 */
function useResolvedCustomChatApiUrl(envUrl: string): string {
  const [resolved, setResolved] = React.useState(envUrl);

  React.useEffect(() => {
    if (!envUrl) return;
    if (/^https?:\/\//i.test(envUrl)) {
      setResolved(envUrl);
      return;
    }
    try {
      const path = envUrl.startsWith("/") ? envUrl : `/${envUrl}`;
      setResolved(new URL(path, window.location.origin).href);
    } catch {
      setResolved(envUrl);
    }
  }, [envUrl]);

  return resolved;
}

/**
 * ChatKit is one web component (`<openai-chatkit>`) that includes transcript + composer.
 * `Chat` / `Composer` here are thin layout wrappers; Composer is a no-op slot.
 */
export function ChatKitProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const domainKey =
    process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY?.trim() ?? "";
  const envCustomApiUrl = getCustomChatApiUrl();
  const customApiUrl = useResolvedCustomChatApiUrl(envCustomApiUrl);
  const resolvedPanelBg = useResolvedChatPanelBackground();

  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  const options: UseChatKitOptions = React.useMemo(() => {
    const base = CHATKIT_THEME_BY_SITE_THEME[resolvedTheme];

    const themeOption = base;

    const useCustomBackend = customApiUrl !== "";

    const api = useCustomBackend
      ? {
          url: customApiUrl,
          domainKey,
        }
      : {
          getClientSecret: async (_currentClientSecret: string | null) => {
            const user = getOrCreateChatKitUserId();
            const res = await fetch("/api/chatkit/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user }),
            });
            const data = (await res.json().catch(() => null)) as {
              client_secret?: string;
              error?: unknown;
            } | null;
            if (!res.ok || !data?.client_secret) {
              console.error(
                "[ChatKit] /api/chatkit/session failed:",
                res.status,
                data ?? "(no JSON body)"
              );
              const errField = data?.error;
              const msg =
                typeof errField === "string"
                  ? errField
                  : errField &&
                      typeof errField === "object" &&
                      errField !== null &&
                      "message" in errField &&
                      typeof (errField as { message?: unknown }).message === "string"
                    ? (errField as { message: string }).message
                    : "Could not start ChatKit session";
              setSessionError(msg);
              throw new Error(msg);
            }
            setSessionError(null);
            return data.client_secret;
          },
        };

    return {
      api,
      theme: themeOption,
      header: { enabled: false },
      startScreen: {
        greeting: "Hello, what can I help you with today?",
        prompts: [],
      },
      composer: {
        placeholder: "Type a message…",
      },
      threadItemActions: {
        feedback: false,
      },
      onError: (detail: { error: Error }) => {
        const err = detail.error;
        console.error("[ChatKit] chatkit.error:", err);
        setSessionError((prev) => prev ?? err.message);
      },
    };
  }, [customApiUrl, domainKey, resolvedTheme]);

  const showDomainKeyWarning = customApiUrl !== "" && !domainKey;

  return (
    <ResolvedChatPanelBgContext.Provider value={resolvedPanelBg}>
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          {showDomainKeyWarning ? (
            <div
              role="status"
              className="mx-4 mb-2 shrink-0 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-sm text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-50"
            >
              {process.env.NODE_ENV === "development" ? (
                <>
                  <strong className="font-medium">ChatKit needs a domain key.</strong> Add{" "}
                  <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                    NEXT_PUBLIC_CHATKIT_DOMAIN_KEY
                  </code>{" "}
                  to{" "}
                  <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                    .env.local
                  </code>{" "}
                  (from OpenAI ChatKit domain registration for this site), then restart{" "}
                  <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                    npm run dev
                  </code>
                  .
                </>
              ) : (
                <>
                  Chat is unavailable right now. If you are the site owner, configure the
                  ChatKit domain key for this deployment.
                </>
              )}
            </div>
          ) : null}
          <Script
            src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
            strategy="afterInteractive"
          />
          {sessionError ? (
            <ChatSessionErrorFallback
              message={sessionError}
              onRetry={() => {
                setSessionError(null);
                setRetryNonce((n) => n + 1);
              }}
            />
          ) : (
            <ChatKitSessionBridge key={retryNonce} options={options}>
              <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">{children}</div>
            </ChatKitSessionBridge>
          )}
        </div>
      </ResolvedChatPanelBgContext.Provider>
  );
}

/** Mounts `useChatKit` so `key` changes reset session state after errors or retry. */
function ChatKitSessionBridge({
  options,
  children,
}: {
  options: UseChatKitOptions;
  children: React.ReactNode;
}) {
  const kit = useChatKit(options);
  return (
    <ChatKitControlContext.Provider value={kit.control}>{children}</ChatKitControlContext.Provider>
  );
}

export type ChatProps = Omit<React.ComponentProps<typeof ChatKit>, "control">;

const CHATKIT_SHADOW_IFRAME_STYLE_ID = "chatkit-host-iframe-bg";

export function Chat(props: ChatProps) {
  const control = useChatKitControl();
  const { resolvedTheme } = useTheme();
  const resolvedPanelBg = React.useContext(ResolvedChatPanelBgContext);
  const hostRef = useRef<OpenAIChatKit | null>(null);
  const { className, style, ...rest } = props;

  /** Page CSS cannot target `.ck-iframe` inside the component shadow root; inject a style tag. */
  useLayoutEffect(() => {
    const iframeBg =
      resolvedPanelBg ??
      (resolvedTheme === "color" ? "var(--sidebar-background)" : "var(--background)");

    const apply = () => {
      const el = hostRef.current;
      if (!el?.shadowRoot) return false;

      let styleEl = el.shadowRoot.querySelector(
        `style#${CHATKIT_SHADOW_IFRAME_STYLE_ID}`
      ) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = CHATKIT_SHADOW_IFRAME_STYLE_ID;
        el.shadowRoot.appendChild(styleEl);
      }
      styleEl.textContent = `
        .ck-iframe {
          background-color: ${iframeBg} !important;
        }
      `;
      return true;
    };

    if (apply()) return;
    const id = requestAnimationFrame(() => {
      apply();
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme, resolvedPanelBg]);

  const hostBackground =
    resolvedPanelBg ??
    (resolvedTheme === "color" ? "var(--sidebar-background)" : "var(--background)");

  return (
    <ChatKit
      {...rest}
      ref={hostRef}
      control={control}
      className={cn(
        "p-0 m-0 shadow-none border-0 ring-0 outline-none",
        "min-h-0 w-full max-w-none",
        className
      )}
      style={{ background: hostBackground, ...style }}
    />
  );
}

/** Optional layout slot; ChatKit’s composer lives inside the iframe. */
export function Composer(_props: { className?: string }) {
  return null;
}
