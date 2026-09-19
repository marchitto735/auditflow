"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/** Body ref for portal container (client-only so scheduling dialog is viewport-centered) */
const getBody = () => (typeof document !== "undefined" ? document.body : undefined);

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        "ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
        className
      )}
      aria-label="Close"
      {...props}
    />
  );
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({
  className,
  style,
  noDefaultBg = false,
  transparent = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & {
  noDefaultBg?: boolean;
  transparent?: boolean;
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      data-transparent={transparent ? "" : undefined}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50",
        !noDefaultBg && "bg-foreground/50",
        className
      )}
      style={transparent ? style : undefined}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  centerInViewport = false,
  overlayClassName,
  transparentOverlay = false,
  style: propsStyle,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  centerInViewport?: boolean;
  overlayClassName?: string;
  transparentOverlay?: boolean;
}) {
  const hasCustomOverlay = !!overlayClassName;
  const contentTransparentBackdrop = transparentOverlay || hasCustomOverlay;
  const portalContainer = centerInViewport ? getBody() : undefined;

  const overlayClass = cn(overlayClassName, transparentOverlay && "bg-transparent opacity-100");
  const contentStyle = contentTransparentBackdrop && propsStyle
    ? (() => {
        const { backgroundColor: _bg, ...rest } = propsStyle;
        return Object.keys(rest).length > 0 ? rest : undefined;
      })()
    : contentTransparentBackdrop
      ? undefined
      : propsStyle;

  return (
    <DialogPortal container={portalContainer}>
      <DialogOverlay
        noDefaultBg={transparentOverlay || hasCustomOverlay}
        transparent={transparentOverlay}
        className={overlayClass}
      />

      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-center-in-viewport={centerInViewport ? "" : undefined}
        data-transparent-backdrop={contentTransparentBackdrop ? "" : undefined}
        className={cn(
          centerInViewport
            ? "z-50 p-0 bg-transparent block"
            : "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-0 z-50 flex flex-col w-full h-full max-w-none max-h-none rounded-none duration-200 md:left-[50%] md:top-[50%] md:right-auto md:bottom-auto md:translate-x-[-50%] md:translate-y-[-50%] md:h-auto md:max-w-[500px] md:rounded-2xl lg:max-w-[600px]",
          contentTransparentBackdrop && "bg-transparent",
          className
        )}
        style={contentStyle}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            className="ring-offset-background focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-h6 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-body2", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
