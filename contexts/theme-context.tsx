"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Theme } from "@/lib/theme-types";
import { resolveThemeForRoute } from "@/lib/theme-route";

export type { Theme };

const THEME_KEY = "theme";
const THEME_TRANSITION_CLASS = "theme-transition";

const THEMES: Theme[] = ["light", "dark", "color"];

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  THEMES.forEach((t) => html.classList.remove(t));
  html.classList.add(theme);
}

function getThemeFromStorage(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "color" || stored === "light")
    return stored;
  return "light";
}

const ThemeContext = React.createContext<{
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>("light");

  useLayoutEffect(() => {
    setThemeState(getThemeFromStorage());
  }, []);

  const resolvedTheme = useMemo(
    () => resolveThemeForRoute(theme, pathname),
    [theme, pathname]
  );

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add(THEME_TRANSITION_CLASS);
    }
    localStorage.setItem(THEME_KEY, next);
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  const pathname = usePathname();
  const [fallbackTheme, setFallbackTheme] = useState<Theme>("light");

  useEffect(() => {
    if (!ctx) setFallbackTheme(getThemeFromStorage());
  }, [ctx]);

  const resolvedFallback = useMemo(
    () => resolveThemeForRoute(fallbackTheme, pathname),
    [fallbackTheme, pathname]
  );

  useLayoutEffect(() => {
    if (ctx) return;
    applyTheme(resolvedFallback);
  }, [ctx, resolvedFallback]);

  const setTheme = useCallback((next: Theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add(THEME_TRANSITION_CLASS);
    }
    localStorage.setItem(THEME_KEY, next);
    setFallbackTheme(next);
  }, []);

  if (ctx) return ctx;
  return { theme: fallbackTheme, resolvedTheme: resolvedFallback, setTheme };
}
