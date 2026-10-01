import * as React from "react"

import {
  CARD_BODY_CLASS,
  CARD_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
} from "@/lib/page-layout"
import { cn } from "@/lib/utils"

/**
 * Base surface for every AuditFlow card — flat, uniform border + radius, no elevation.
 * Prefer composing with `DASHBOARD_CARD_CLASS` only when you need the token elsewhere;
 * `<Card>` already applies it.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col",
        DASHBOARD_CARD_CLASS,
        className
      )}
      {...props}
    />
  )
}

/**
 * Header region — 8px gap between eyebrow and title/description for consistent rhythm.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card section eyebrow — sentence case, 14px medium (no CSS uppercase).
 */
function CardEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-eyebrow"
      className={cn(CARD_EYEBROW_CLASS, className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("m-0 leading-none font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(CARD_BODY_CLASS, "max-w-xl", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardEyebrow,
  CardAction,
  CardDescription,
  CardContent,
}
