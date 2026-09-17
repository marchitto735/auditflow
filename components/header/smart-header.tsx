"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const TOP_REVEAL_PX = 16;
const DIRECTION_DELTA_PX = 6;

type SmartHeaderProps = {
  children: ReactNode;
  className?: string;
  /** Keep the bar visible (e.g. while a sheet/menu is open). */
  locked?: boolean;
  /** Change this (pathname) to show the bar again after navigation. */
  resetKey?: string;
};

export default function SmartHeader({
  children,
  className,
  locked = false,
  resetKey,
}: SmartHeaderProps) {
  const reduceMotion = useReducedMotion();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
  }, [resetKey]);

  useEffect(() => {
    if (locked) {
      setHidden(false);
      return;
    }

    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = Math.max(0, window.scrollY);
        const delta = y - lastY;
        lastY = y;

        if (y <= TOP_REVEAL_PX) {
          setHidden(false);
          return;
        }
        if (delta > DIRECTION_DELTA_PX) setHidden(true);
        else if (delta < -DIRECTION_DELTA_PX) setHidden(false);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [locked]);

  const offScreen = !locked && hidden;

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full min-w-0",
        className,
      )}
      initial={false}
      animate={{ y: offScreen ? "-100%" : 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
      }
    >
      {children}
    </motion.header>
  );
}
