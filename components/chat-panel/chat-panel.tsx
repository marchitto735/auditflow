"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChatKitProvider, Chat } from "./chatkit-provider";

type ChatPanelContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ChatPanelContext = React.createContext<ChatPanelContextValue | null>(null);

export function useChatPanel(): ChatPanelContextValue {
  const ctx = React.useContext(ChatPanelContext);
  if (!ctx) {
    throw new Error("useChatPanel must be used within ChatPanelProvider");
  }
  return ctx;
}

function ChatSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="chat-panel"
        side="right"
        className="chat-sheet flex h-full w-full max-w-full flex-col p-0 sm:w-full sm:max-w-full md:w-full md:max-w-full lg:max-w-md border-0 bg-background color:bg-sidebar-background text-sidebar-foreground"
        closeButtonClassName="absolute top-4 right-4 h-8 w-8 min-h-8 min-w-8 p-0 rounded-sm border-0 bg-transparent hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(42%_0.035_165)] text-foreground hover:text-sidebar-accent-foreground !data-[state=open]:bg-transparent transition-colors flex items-center justify-center [&_svg]:text-current [&_svg]:transition-colors hover:[&_svg]:text-sidebar-accent-foreground"
      >
        <SheetTitle className="sr-only">Chat</SheetTitle>
        <SheetHeader className="shrink-0 gap-4 px-4 pt-4 pr-4">
          <h6 className="text-subtitle1 font-medium text-foreground font-sans">
            Chat Assistant
          </h6>
          <p className="sr-only text-body2 text-foreground">
            Hello!
          </p>
        </SheetHeader>
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col px-4">
            <ChatKitProvider>
              <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
                <Chat className="min-h-0 min-w-0 w-full flex-1" />
              </div>
            </ChatKitProvider>
          </div>
        </div>
        <SheetFooter className="mt-4 shrink-0 px-4 pb-4">
          <SheetClose asChild>
            <Button variant="outline" className="text-button chat-sheet-close-pill bg-transparent border border-[oklch(92%_0_0)] focus-visible:border-[oklch(92%_0_0)] dark:border-[oklch(30%_0.01_264)] color:border-[oklch(40%_0.035_165)] hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)]">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function ChatPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);

  return (
    <ChatPanelContext.Provider value={value}>
      {children}
      <ChatSheet open={open} onOpenChange={setOpen} />
    </ChatPanelContext.Provider>
  );
}

type ChatTriggerChildProps = { onClick?: (e: React.MouseEvent) => void };

/** Opens the single app-wide chat sheet; merge-clicks with the child (e.g. close mobile menu first). */
export function ChatTrigger({ children }: { children: React.ReactElement<ChatTriggerChildProps> }) {
  const { setOpen } = useChatPanel();
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      setOpen(true);
    },
  });
}
