"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChatBubbleProps = React.ComponentProps<"div"> & {
  variant?: "default" | "sent" | "received";
};

function ChatBubble({
  className,
  variant = "received",
  children,
  ...rest
}: ChatBubbleProps) {
  return (
    <Card
      data-slot="chat-bubble"
      data-variant={variant}
      className={cn(
        "relative max-w-[85%] min-w-0 min-h-12 rounded-2xl border px-0 py-0 gap-0 border-[oklch(92%_0_0)] dark:border-[oklch(30%_0.01_264)] color:border-[oklch(44%_0.035_165)] shadow-none",
        variant === "received" &&
          "rounded-bl-lg bg-muted text-muted-foreground dark:bg-[oklch(26%_0.01_264)] color:bg-[oklch(30%_0.035_165)] dark:text-foreground color:text-foreground",
        variant === "sent" &&
          "ml-auto rounded-br-lg bg-primary text-primary-foreground",
        variant === "default" &&
          "bg-muted text-muted-foreground dark:bg-[oklch(26%_0.01_264)] color:bg-[oklch(30%_0.035_165)] dark:text-foreground color:text-foreground",
        className
      )}
      {...rest}
    >
      <CardContent className="px-4 py-3 text-body2">
        {children}
      </CardContent>
    </Card>
  );
}

function ChatBubbleMessage({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="chat-bubble-message"
      className={cn("text-body2 my-0", className)}
      {...props}
    />
  );
}

export { ChatBubble, ChatBubbleMessage };
