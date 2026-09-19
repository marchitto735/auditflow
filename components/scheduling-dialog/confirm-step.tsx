"use client";

import * as React from "react";
import { CheckCircle2, ExternalLink, Mail, CalendarPlus } from "lucide-react";
import { FiDownload } from "react-icons/fi";
import { SiGooglecalendar } from "react-icons/si";
import { Button } from "@/components/ui/button";

export type ConfirmStepProps = {
  name: string;
  email: string;
  guestEmail: string;
  formattedDate: string;
  startTimeLabel: string;
  formattedTimeZone: string;
  notes?: string;
  meetingUrl?: string | null;
  rescheduleUrl?: string | null;
  cancelUrl?: string | null;
  googleCalendarUrl?: string | null;
  outlookCalendarUrl?: string | null;
  office365CalendarUrl?: string | null;
  icsUrl?: string | null;
};

const ConfirmStep = React.memo(function ConfirmStep({
  name,
  email,
  guestEmail,
  formattedDate,
  startTimeLabel,
  formattedTimeZone,
  notes,
  meetingUrl,
  rescheduleUrl,
  cancelUrl,
  googleCalendarUrl,
  outlookCalendarUrl,
  office365CalendarUrl,
  icsUrl,
}: ConfirmStepProps) {
  return (
    <div className="flex w-full flex-col text-left">
      <div className="shrink-0 mb-[16px]">
        <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="text-subtitle1 text-foreground dark:text-white color:text-white pt-0">This meeting is scheduled</h2>
        <p className="text-body2 text-foreground mt-1">We sent a calendar invite with the details to everyone.</p>
        <dl className="flex flex-col gap-4 text-body2 mt-[32px] items-start">
          <div className="w-full">
            <dt className="text-foreground dark:text-white color:text-white font-medium">What</dt>
            <dd className="text-foreground dark:text-white color:text-white mt-0.5">Introduction Call between {name || "Guest"} and Mike Marchitto</dd>
          </div>
          <div className="w-full">
            <dt className="text-foreground dark:text-white color:text-white font-medium">When</dt>
<dd className="text-foreground dark:text-white color:text-white mt-0.5">
            {formattedDate}
              <br />
              {startTimeLabel} ({formattedTimeZone})
            </dd>
          </div>
          <div className="w-full">
            <dt className="text-foreground dark:text-white color:text-white font-medium">Who</dt>
            <dd className="text-foreground dark:text-white color:text-white mt-0.5">
              <span className="inline-flex items-center gap-1">
                Mike Marchitto <span className="rounded border border-border dark:border-white color:border-white bg-transparent text-black dark:text-white color:text-white text-xs px-1.5 py-0.5">Host</span>
              </span>
              <br />
              {email}
              {guestEmail && (
                <>
                  <br />
                  {name || "Guest"} — {guestEmail}
                </>
              )}
            </dd>
          </div>
          <div className="w-full">
            <dt className="text-foreground dark:text-white color:text-white font-medium">Where</dt>
            <dd className="text-foreground dark:text-white color:text-white mt-0.5 inline-flex items-center gap-2">
              {meetingUrl ? (
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-foreground no-underline underline-offset-2 hover:underline"
                >
                  Cal video <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ) : (
                <span className="opacity-70">(provided after booking)</span>
              )}
            </dd>
          </div>
          {notes != null && notes.trim() !== "" && (
            <div className="w-full">
              <dt className="text-foreground dark:text-white color:text-white font-medium">Notes</dt>
              <dd className="text-foreground dark:text-white color:text-white mt-0.5 whitespace-pre-wrap break-words">{notes.trim()}</dd>
            </div>
          )}
        </dl>
        <div className="flex flex-nowrap items-center justify-start gap-2 mt-[48px]">
          {rescheduleUrl ? (
            <a
              href={rescheduleUrl}
              target="_blank"
              rel="noreferrer"
              className="text-body2 text-foreground no-underline mr-4 transition-colors hover:text-[oklch(50%_0_0)] color:hover:text-[oklch(48%_0.035_165)]"
            >
              Reschedule
            </a>
          ) : (
            <span className="text-body2 text-foreground opacity-70 mr-4">Reschedule</span>
          )}

          {cancelUrl ? (
            <a
              href={cancelUrl}
              target="_blank"
              rel="noreferrer"
              className="text-body2 text-foreground no-underline transition-colors hover:text-[oklch(50%_0_0)] color:hover:text-[oklch(48%_0.035_165)]"
            >
              Cancel
            </a>
          ) : (
            <span className="text-body2 text-foreground opacity-70">Cancel</span>
          )}

          <div className="flex items-center gap-1 ml-[72px]">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="!h-11 !min-h-11 !w-11 !min-w-11 !p-3.5 shrink-0 rounded-sm border-0 bg-transparent hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)] transition-colors"
              aria-label="Google Calendar"
            >
              {googleCalendarUrl ? (
                <a href={googleCalendarUrl} target="_blank" rel="noreferrer">
                  <SiGooglecalendar className="h-4 w-4" />
                </a>
              ) : (
                <span className="opacity-60">
                  <SiGooglecalendar className="h-4 w-4" />
                </span>
              )}
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="!h-11 !min-h-11 !w-11 !min-w-11 !p-3.5 shrink-0 rounded-sm border-0 bg-transparent hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)] transition-colors"
              aria-label="Outlook"
            >
              {outlookCalendarUrl ? (
                <a href={outlookCalendarUrl} target="_blank" rel="noreferrer">
                  <Mail className="h-4 w-4" />
                </a>
              ) : (
                <span className="opacity-60">
                  <Mail className="h-4 w-4" />
                </span>
              )}
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="!h-11 !min-h-11 !w-11 !min-w-11 !p-3.5 shrink-0 rounded-sm border-0 bg-transparent hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)] transition-colors"
              aria-label="Office 365"
            >
              {office365CalendarUrl ? (
                <a href={office365CalendarUrl} target="_blank" rel="noreferrer">
                  <CalendarPlus className="h-4 w-4" />
                </a>
              ) : (
                <span className="opacity-60">
                  <CalendarPlus className="h-4 w-4" />
                </span>
              )}
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="!h-11 !min-h-11 !w-11 !min-w-11 !p-3.5 shrink-0 rounded-sm border-0 bg-transparent hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)] transition-colors"
              aria-label="ICS"
            >
              {icsUrl ? (
                <a href={icsUrl} target="_blank" rel="noreferrer" download>
                  <FiDownload className="h-4 w-4" />
                </a>
              ) : (
                <span className="opacity-60">
                  <FiDownload className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export { ConfirmStep };
