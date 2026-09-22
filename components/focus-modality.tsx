"use client";

import { useEffect } from "react";

/**
 * Tracks whether the last interaction was keyboard (Tab) or pointer.
 * Browsers match `:focus-visible` on mouse click for text inputs; we use
 * `data-focus-modality` so focus rings only appear after Tab navigation.
 */
export function FocusModality() {
  useEffect(() => {
    const root = document.documentElement;

    const setPointer = () => {
      root.setAttribute("data-focus-modality", "pointer");
    };

    const setKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        root.setAttribute("data-focus-modality", "keyboard");
      }
    };

    root.setAttribute("data-focus-modality", "pointer");
    window.addEventListener("keydown", setKeyboard, true);
    window.addEventListener("pointerdown", setPointer, true);

    return () => {
      window.removeEventListener("keydown", setKeyboard, true);
      window.removeEventListener("pointerdown", setPointer, true);
    };
  }, []);

  return null;
}
