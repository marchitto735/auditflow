"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type DetailsStepProps = {
  name: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  notes: string;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  showAddGuestInput: boolean;
  onToggleAddGuest: () => void;
  guestEmail: string;
  onGuestEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
};

const DetailsStep = React.memo(function DetailsStep({
  name,
  onNameChange,
  email,
  onEmailChange,
  notes,
  onNotesChange,
  showAddGuestInput,
  onToggleAddGuest,
  guestEmail,
  onGuestEmailChange,
  onBack,
  onConfirm,
  isSubmitting = false,
  submitError = null,
}: DetailsStepProps) {
  return (
    <div className="flex flex-col">
      <h2
        className="text-subtitle1 font-medium text-foreground dark:text-white color:text-white mb-4"
        style={{ textTransform: "none" }}
      >
        Your Details
      </h2>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="scheduling-name" className="block text-subtitle2 text-foreground mb-1.5">Name *</label>
          <Input
            id="scheduling-name"
            placeholder="Enter your name"
            value={name}
            onChange={onNameChange}
            className="w-full !text-[0.875rem] leading-[1.45] border border-[oklch(92%_0_0)] color:border-[oklch(44%_0.035_165)] bg-muted color:bg-[oklch(30%_0.035_165)] text-foreground placeholder:text-muted-foreground color:text-[oklch(66%_0.035_165)] color:placeholder:text-[oklch(66%_0.035_165)] dark:bg-[oklch(26%_0.01_264)] dark:border-[oklch(30%_0.01_264)] dark:text-white dark:placeholder:text-[oklch(70%_0.01_264)] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <label htmlFor="scheduling-email" className="block text-subtitle2 text-foreground mb-1.5">Email *</label>
          <Input
            id="scheduling-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={onEmailChange}
            className="w-full !text-[0.875rem] leading-[1.45] border border-[oklch(92%_0_0)] color:border-[oklch(44%_0.035_165)] bg-muted color:bg-[oklch(30%_0.035_165)] text-foreground placeholder:text-muted-foreground color:text-[oklch(66%_0.035_165)] color:placeholder:text-[oklch(66%_0.035_165)] dark:bg-[oklch(26%_0.01_264)] dark:border-[oklch(30%_0.01_264)] dark:text-white dark:placeholder:text-[oklch(70%_0.01_264)] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <label htmlFor="scheduling-notes" className="block text-subtitle2 text-foreground mb-1.5">Notes</label>
          <Textarea
            id="scheduling-notes"
            placeholder="Please share anything that would be helpful for our meeting like context or topics to focus on."
            value={notes}
            onChange={onNotesChange}
            className="w-full min-h-[80px] !text-[0.875rem] leading-[1.45] border border-[oklch(92%_0_0)] color:border-[oklch(44%_0.035_165)] bg-muted color:bg-[oklch(30%_0.035_165)] text-foreground placeholder:text-muted-foreground color:text-[oklch(66%_0.035_165)] color:placeholder:text-[oklch(66%_0.035_165)] dark:bg-[oklch(26%_0.01_264)] dark:border-[oklch(30%_0.01_264)] dark:text-white dark:placeholder:text-[oklch(70%_0.01_264)] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 text-body2 text-foreground transition-colors hover:text-[oklch(50%_0_0)] self-start"
          onClick={onToggleAddGuest}
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          Add guests
        </button>
        {showAddGuestInput && (
          <div>
            <Input
              placeholder="Enter email"
              value={guestEmail}
              onChange={onGuestEmailChange}
              className="w-full !text-[0.875rem] leading-[1.45] border border-[oklch(92%_0_0)] color:border-[oklch(44%_0.035_165)] bg-muted color:bg-[oklch(30%_0.035_165)] text-foreground placeholder:text-muted-foreground color:text-[oklch(66%_0.035_165)] color:placeholder:text-[oklch(66%_0.035_165)] dark:bg-[oklch(26%_0.01_264)] dark:border-[oklch(30%_0.01_264)] dark:text-white dark:placeholder:text-[oklch(70%_0.01_264)] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button
          variant="outline"
          className="text-button flex-1 min-w-0 border-0 hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)]"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          variant="black"
          className="flex-1 min-w-0 text-[length:var(--text-button-size)] leading-[var(--line-height-button)] font-[var(--font-weight-button)] dark:border-[oklch(30%_0.01_264)] color:border-[oklch(44%_0.035_165)] dark:bg-white dark:hover:bg-[oklch(92%_0_0)] color:bg-white color:hover:bg-[oklch(94%_0.03_160)] dark:!text-black color:!text-[oklch(24%_0.035_165)]"
          onClick={onConfirm}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Confirming..." : "Confirm"}
        </Button>
      </div>
      {submitError ? (
        <p className="text-body2 text-red-500 mt-3" role="alert">
          {submitError}
        </p>
      ) : null}
    </div>
  );
});

export { DetailsStep };
