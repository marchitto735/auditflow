"use client";

import * as React from "react";
import { Clock, Video, Globe, XIcon, ChevronDown, ChevronUp, Check, Loader2, Calendar as CalendarIcon } from "lucide-react";
import type { DayButton } from "react-day-picker";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { SelectStep } from "./select-step";
import { DetailsStep } from "./details-step";
import { ConfirmStep } from "./confirm-step";

const COLOR_THEME_BACKGROUND = "oklch(24% 0.035 165)";

/** IANA timezone → short abbreviation for display. Stored value remains IANA. */
const TIMEZONE_ABBR: Record<string, string> = {
  "America/New_York": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  "America/Los_Angeles": "PT",
  "America/Phoenix": "MST",
  "America/Anchorage": "AKT",
  "America/Toronto": "ET",
  "America/Vancouver": "PT",
  "America/Edmonton": "MT",
  "America/Winnipeg": "CT",
  "America/Halifax": "AT",
  "America/St_Johns": "NT",
  "Europe/London": "GMT",
  "Europe/Paris": "CET",
  "Europe/Berlin": "CET",
  "Europe/Amsterdam": "CET",
  "Europe/Brussels": "CET",
  "Europe/Madrid": "CET",
  "Europe/Rome": "CET",
  "Europe/Stockholm": "CET",
  "Europe/Vienna": "CET",
  "Europe/Zurich": "CET",
  "Europe/Moscow": "MSK",
  "Asia/Tokyo": "JST",
  "Asia/Seoul": "KST",
  "Asia/Shanghai": "CST",
  "Asia/Hong_Kong": "HKT",
  "Asia/Singapore": "SGT",
  "Asia/Kolkata": "IST",
  "Asia/Dubai": "GST",
  "Australia/Sydney": "AEST",
  "Australia/Melbourne": "AEST",
  "Australia/Perth": "AWST",
  "Pacific/Auckland": "NZST",
  UTC: "UTC",
};

/**
 * Format IANA timezone for display only. Value stored and passed remains IANA.
 * Returns "City (ABBR)" when abbr is in map, else "City".
 */
function formatTimezoneLabel(iana: string): string {
  const parts = iana.split("/");
  const city = parts[parts.length - 1]?.replace(/_/g, " ") ?? iana;
  const abbr = TIMEZONE_ABBR[iana];
  return abbr ? `${city} (${abbr})` : city;
}

const TIME_ZONES: string[] =
  typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["America/New_York", "America/Los_Angeles", "Europe/London", "UTC"];

type SchedulingDialogProps = {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

let SchedulingDialog: React.FC<SchedulingDialogProps>;
try {
  function SchedulingCalendarDayButton({
    className,
    day,
    modifiers,
    children,
    ...props
  }: React.ComponentProps<typeof DayButton>) {
    const ref = React.useRef<HTMLButtonElement>(null);
    const { resolvedTheme } = useTheme();
    React.useEffect(() => {
      if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    const isOutsideInColorMode = resolvedTheme === "color" && modifiers.outside;
    const colorStyle = isOutsideInColorMode ? { color: "#ffffff" as const } : undefined;

    return (
      <button
        ref={ref}
        type="button"
        data-day={day.date.toLocaleDateString()}
        data-outside={modifiers.outside}
        data-selected-single={
          modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle
        }
        data-range-start={modifiers.range_start}
        data-range-end={modifiers.range_end}
        data-range-middle={modifiers.range_middle}
        style={colorStyle}
        className={cn(
          "rdp-day-button border border-border dark:border-[oklch(30%_0.01_264)] color:border-[oklch(44%_0.035_165)] bg-muted hover:bg-[oklch(92%_0_0)] dark:bg-[oklch(26%_0.01_264)] dark:hover:bg-[oklch(30%_0.01_264)] color:bg-[oklch(38%_0.035_165)] color:hover:bg-[oklch(48%_0.035_165)] data-[selected-single=true]:border-[oklch(22%_0_0)] color:data-[selected-single=true]:border-transparent inline-flex items-center justify-center rounded-lg transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none text-button text-foreground data-[outside=true]:!border-transparent data-[outside=true]:!bg-transparent data-[outside=true]:!hover:bg-transparent color:data-[outside=true]:!text-white data-[selected-single=true]:!bg-black data-[selected-single=true]:!text-white data-[selected-single=true]:hover:!bg-black data-[selected-single=true]:dark:!bg-white data-[selected-single=true]:dark:!text-black data-[selected-single=true]:color:!bg-white data-[selected-single=true]:color:!text-[oklch(24%_0.035_165)] data-[selected-single=true]:rounded-lg data-[range-middle=true]:text-foreground data-[range-start=true]:text-white data-[range-end=true]:text-white group-data-[focused=true]/day:border-0 group-data-[focused=true]/day:ring-0 flex aspect-square size-auto w-full min-w-(--cell-size) leading-none group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 data-[range-end=true]:rounded-lg data-[range-end=true]:rounded-r-lg data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-lg data-[range-start=true]:rounded-l-lg px-0 py-0",
          className
        )}
        {...props}
      >
        <span
          style={colorStyle}
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center text-center text-button"
        >
          {children}
        </span>
      </button>
    );
  }

  function pad2(n: number): string {
    return n.toString().padStart(2, "0");
  }

  function formatYmdLocal(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function formatStartTimeLabel(start: string, fmt: "12h" | "24h"): string {
    const parsed = new Date(start);
    if (Number.isNaN(parsed.getTime())) return start;

    const hours = parsed.getHours();
    const minutes = parsed.getMinutes();

    if (fmt === "24h") return `${pad2(hours)}:${pad2(minutes)}`;

    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours < 12 ? "am" : "pm";
    return `${hour12}:${pad2(minutes)}${ampm}`;
  }

  function formatCalendarDateUtc(dt: string): string | null {
    const parsed = new Date(dt);
    if (Number.isNaN(parsed.getTime())) return null;
    const yyyy = parsed.getUTCFullYear();
    const mm = pad2(parsed.getUTCMonth() + 1);
    const dd = pad2(parsed.getUTCDate());
    const hh = pad2(parsed.getUTCHours());
    const mi = pad2(parsed.getUTCMinutes());
    const ss = pad2(parsed.getUTCSeconds());
    return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
  }

  function getByPath(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  function pickFirstString(obj: unknown, paths: string[]): string | null {
    for (const p of paths) {
      const v = getByPath(obj, p);
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
  }

  function pickFirstUrlString(obj: unknown, paths: string[]): string | null {
    for (const p of paths) {
      const v = getByPath(obj, p);
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed && /^https?:\/\//i.test(trimmed)) return trimmed;
      }
    }
    return null;
  }

  function extractAvailabilityStartValues(data: unknown, requestedDateYmd?: string): string[] {
    const rawItems: unknown[] = [];

    if (Array.isArray(data)) {
      rawItems.push(...data);
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;

      // Common shapes: { [date]: [..] }, { slots: { [date]: [..] } }, { availableTimes: [...] }
      if (requestedDateYmd && Array.isArray(obj[requestedDateYmd])) {
        rawItems.push(...(obj[requestedDateYmd] as unknown[]));
      }

      const slotsObj = obj.slots;
      if (!rawItems.length && slotsObj && typeof slotsObj === "object") {
        const slotsRec = slotsObj as Record<string, unknown>;
        const dateKey =
          requestedDateYmd && Array.isArray(slotsRec[requestedDateYmd])
            ? requestedDateYmd
            : Object.keys(slotsRec)[0];
        const arr = dateKey && Array.isArray(slotsRec[dateKey]) ? (slotsRec[dateKey] as unknown[]) : null;
        if (arr) rawItems.push(...arr);
      }

      const innerData = obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : null;
      const arrayCandidates = [
        obj.availableTimes,
        obj.availableSlots,
        obj.collection,
        obj.slots,
        innerData?.availableTimes,
        innerData?.availableSlots,
      ].filter((v): v is unknown[] => Array.isArray(v));

      for (const arr of arrayCandidates) rawItems.push(...arr);
    }

    const starts: string[] = [];
    for (const item of rawItems) {
      if (typeof item === "string") {
        starts.push(item);
        continue;
      }
      if (!item || typeof item !== "object") continue;

      const start =
        pickFirstString(item, ["start", "startTime", "time", "value"]) ??
        pickFirstString(item, ["timeZoneStart", "slot", "slotStart", "start_time"]);

      if (start) starts.push(start);
    }

    // De-dupe while keeping order.
    const seen = new Set<string>();
    return starts.filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
  }

  SchedulingDialog = function SchedulingDialog({ trigger, open, onOpenChange }: SchedulingDialogProps) {
    const [radixReady, setRadixReady] = React.useState(false);
    React.useEffect(() => {
      setRadixReady(true);
    }, []);
    const { resolvedTheme } = useTheme();
    const [step, setStep] = React.useState<"date" | "time" | "details" | "confirm">("date");
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
    const [availableStarts, setAvailableStarts] = React.useState<string[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = React.useState(false);
    const [availabilityError, setAvailabilityError] = React.useState<string | null>(null);
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
    const [selectedTimeLabel, setSelectedTimeLabel] = React.useState<string | null>(null);
    const [bookingLoading, setBookingLoading] = React.useState(false);
    const [bookingError, setBookingError] = React.useState<string | null>(null);
    const [confirmation, setConfirmation] = React.useState<unknown | null>(null);
    const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">("12h");
    const [timeZone, setTimeZone] = React.useState<string>(() =>
      typeof Intl !== "undefined" && typeof Intl.DateTimeFormat !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "America/New_York"
    );
    const [timezoneOpen, setTimezoneOpen] = React.useState(false);
    const selectedRef = React.useRef<HTMLDivElement>(null);
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [showAddGuestInput, setShowAddGuestInput] = React.useState(false);
    const [guestEmail, setGuestEmail] = React.useState("");

    const handleOpenChange = React.useCallback(
      (next: boolean) => {
        if (!next) {
          setStep("date");
          setSelectedDate(null);
          setAvailableStarts([]);
          setAvailabilityLoading(false);
          setAvailabilityError(null);
          setSelectedTime(null);
          setSelectedTimeLabel(null);
          setBookingLoading(false);
          setBookingError(null);
          setConfirmation(null);
          setName("");
          setEmail("");
          setNotes("");
          setShowAddGuestInput(false);
          setGuestEmail("");
        }
        onOpenChange?.(next);
      },
      [onOpenChange]
    );

    const timeSlots = React.useMemo(
      () =>
        availableStarts.map((start) => ({
          value: start,
          label: formatStartTimeLabel(start, timeFormat),
        })),
      [availableStarts, timeFormat]
    );

    const selectedLabel = React.useMemo(
      () =>
        date
          ? `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.getDate()}`
          : "Select a date",
      [date]
    );

    const formattedDateAtTime =
      selectedDate && selectedTimeLabel
        ? `${selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })} at ${selectedTimeLabel}`
        : null;

    const formattedDateConfirm = React.useMemo(
      () =>
        selectedDate
          ? selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
      [selectedDate]
    );

    const formattedTimeZone = React.useMemo(
      () => formatTimezoneLabel(timeZone),
      [timeZone]
    );

    const onTimeFormatChange = React.useCallback((v: "12h" | "24h") => {
      setTimeFormat(v);
    }, []);

    const handleDateSelect = React.useCallback((newDate: Date | undefined) => {
      const doFetch = async () => {
        if (!newDate) return;

        setDate(newDate);
        setSelectedDate(newDate);
        setSelectedTime(null);
        setSelectedTimeLabel(null);
        setAvailableStarts([]);
        setAvailabilityError(null);
        setConfirmation(null);
        setBookingError(null);
        setBookingLoading(false);

        setAvailabilityLoading(true);
        setStep("time");

        const dateYmd = formatYmdLocal(newDate);

        try {
          const res = await fetch("/api/schedule/availability", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ date: dateYmd }),
          });

          const json: unknown = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(pickFirstString(json, ["error", "message"]) ?? "Failed to load availability");
          }

          const starts = extractAvailabilityStartValues(json, dateYmd);
          setAvailableStarts(starts);

          if (starts.length === 0) {
            setAvailabilityError("No available times for this date.");
          }
        } catch (err) {
          setAvailabilityError(err instanceof Error ? err.message : "Failed to load availability");
        } finally {
          setAvailabilityLoading(false);
        }
      };

      void doFetch();
    }, []);

    const handleTimeSelect = React.useCallback(
      (timeValue: string) => {
        setSelectedTime(timeValue);
        setSelectedTimeLabel(formatStartTimeLabel(timeValue, timeFormat));
        setStep("details");
      },
      [timeFormat]
    );

    const onNameChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
      []
    );
    const onEmailChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
      []
    );
    const onNotesChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value),
      []
    );
    const onToggleAddGuest = React.useCallback(() => {
      setShowAddGuestInput((v) => !v);
    }, []);
    const onGuestEmailChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setGuestEmail(e.target.value),
      []
    );
    const onBack = React.useCallback(() => {
      setStep("time");
    }, []);

    const handleSubmit = React.useCallback(() => {
      const submit = async () => {
        if (!selectedTime) return;
        if (!name.trim() || !email.trim()) return;

        setBookingLoading(true);
        setBookingError(null);
        try {
          const res = await fetch("/api/schedule/book", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              start: selectedTime,
              name: name.trim(),
              email: email.trim(),
              notes,
              timeZone,
            }),
          });

          const json: unknown = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(pickFirstString(json, ["error", "message"]) ?? "Booking failed");
          }

          setConfirmation(json);
          setStep("confirm");
        } catch (err) {
          setBookingError(err instanceof Error ? err.message : "Booking failed");
        } finally {
          setBookingLoading(false);
        }
      };

      void submit();
    }, [selectedTime, name, email, notes]);

    const confirmationMeetingUrl = React.useMemo(() => {
      if (!confirmation) return null;
      return pickFirstUrlString(confirmation, [
        "videoCallUrl",
        "references.0.meetingUrl",
        "references.0.videoCallUrl",
        "references.0.url",
        "meetingUrl",
        "booking.meetingUrl",
        "booking.location.value",
        "booking.location.url",
        "booking.locationUrl",
        "location.value",
        "location.url",
        "locationUrl",
      ]);
    }, [confirmation]);

    const confirmationRescheduleUrl = React.useMemo(() => {
      if (!confirmation) return null;
      const uid = pickFirstString(confirmation, ["uid", "booking.uid"]);
      const eventTypeSlug =
        pickFirstString(confirmation, ["eventType.slug", "eventTypeSlug", "booking.eventTypeSlug"]) ?? "30min";
      const username =
        pickFirstString(confirmation, ["user.username", "booking.user.username"]) ??
        "michael-marchitto-po60ed";
      const rescheduledBy =
        email.trim() ||
        pickFirstString(confirmation, ["responses.email", "booking.responses.email", "attendees.0.email"]) ||
        "mikemarchitto@gmail.com";

      return uid
        ? `https://cal.com/${encodeURIComponent(username)}/${encodeURIComponent(
            eventTypeSlug
          )}?rescheduleUid=${encodeURIComponent(uid)}&rescheduledBy=${encodeURIComponent(
            rescheduledBy
          )}&overlayCalendar=true`
        : null;
    }, [confirmation, email]);

    const confirmationCancelUrl = React.useMemo(() => {
      if (!confirmation) return null;
      const uid = pickFirstString(confirmation, ["uid", "booking.uid"]);
      const cancelledByEmail = email.trim() || pickFirstString(confirmation, ["responses.email", "booking.responses.email"]) || "";
      return uid
        ? `https://cal.com/booking/${encodeURIComponent(uid)}?cancel=true&cancelledBy=${encodeURIComponent(cancelledByEmail)}`
        : null;
    }, [confirmation]);

    const confirmationIcsUrl = React.useMemo(() => {
      if (!confirmation) return null;
      const title = pickFirstString(confirmation, ["title", "booking.title"]) ?? "Meeting";
      const startTime = pickFirstString(confirmation, ["startTime", "booking.startTime", "start"]) ?? "";
      const endTime = pickFirstString(confirmation, ["endTime", "booking.endTime", "end"]) ?? "";
      const uid = pickFirstString(confirmation, ["uid", "booking.uid"]) ?? "";
      const meetingUrl =
        pickFirstUrlString(confirmation, ["videoCallUrl", "references.0.meetingUrl", "meetingUrl"]) ?? "";

      if (!startTime || !endTime) return null;

      const qs = new URLSearchParams({
        uid,
        title,
        startTime,
        endTime,
        meetingUrl,
      });
      return `/api/schedule/ics?${qs.toString()}`;
    }, [confirmation]);

    const confirmationGoogleCalendarUrl = React.useMemo(() => {
      if (!confirmation) return null;
      const title = pickFirstString(confirmation, ["title", "booking.title"]) ?? "Meeting";
      const startTime = pickFirstString(confirmation, ["startTime", "booking.startTime", "start"]) ?? "";
      const endTime = pickFirstString(confirmation, ["endTime", "booking.endTime", "end"]) ?? "";
      const meetingUrl =
        pickFirstUrlString(confirmation, ["videoCallUrl", "references.0.meetingUrl", "meetingUrl"]) ?? "";
      const startGoogle = formatCalendarDateUtc(startTime);
      const endGoogle = formatCalendarDateUtc(endTime);
      if (!startGoogle || !endGoogle) return null;

      const detailsParts: string[] = [];
      if (typeof notes === "string" && notes.trim()) detailsParts.push(notes.trim());
      if (meetingUrl) detailsParts.push(`Join meeting: ${meetingUrl}`);
      const details = detailsParts.join("\n\n");

      const qs = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${startGoogle}/${endGoogle}`,
        details,
        location: meetingUrl || "Video Call",
      });
      return `https://calendar.google.com/calendar/render?${qs.toString()}`;
    }, [confirmation, notes]);

    const confirmationOutlookCalendarUrl = React.useMemo(() => {
      if (!confirmation) return null;
      const title = pickFirstString(confirmation, ["title", "booking.title"]) ?? "Meeting";
      const startTime = pickFirstString(confirmation, ["startTime", "booking.startTime", "start"]) ?? "";
      const endTime = pickFirstString(confirmation, ["endTime", "booking.endTime", "end"]) ?? "";
      if (!startTime || !endTime) return null;
      const meetingUrl =
        pickFirstUrlString(confirmation, ["videoCallUrl", "references.0.meetingUrl", "meetingUrl"]) ?? "";

      const bodyParts: string[] = [];
      if (typeof notes === "string" && notes.trim()) bodyParts.push(notes.trim());
      if (meetingUrl) bodyParts.push(`Join meeting: ${meetingUrl}`);
      const body = bodyParts.join("\n\n");

      const qs = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: title,
        startdt: startTime,
        enddt: endTime,
        body,
        location: meetingUrl || "Video Call",
      });
      return `https://outlook.live.com/calendar/0/deeplink/compose?${qs.toString()}`;
    }, [confirmation, notes]);

    const confirmationOffice365CalendarUrl = React.useMemo(() => {
      if (!confirmation) return null;
      const title = pickFirstString(confirmation, ["title", "booking.title"]) ?? "Meeting";
      const startTime = pickFirstString(confirmation, ["startTime", "booking.startTime", "start"]) ?? "";
      const endTime = pickFirstString(confirmation, ["endTime", "booking.endTime", "end"]) ?? "";
      if (!startTime || !endTime) return null;
      const meetingUrl =
        pickFirstUrlString(confirmation, ["videoCallUrl", "references.0.meetingUrl", "meetingUrl"]) ?? "";

      const bodyParts: string[] = [];
      if (typeof notes === "string" && notes.trim()) bodyParts.push(notes.trim());
      if (meetingUrl) bodyParts.push(`Join meeting: ${meetingUrl}`);
      const body = bodyParts.join("\n\n");

      const qs = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: title,
        startdt: startTime,
        enddt: endTime,
        body,
        location: meetingUrl || "Video Call",
      });
      return `https://outlook.office.com/calendar/0/deeplink/compose?${qs.toString()}`;
    }, [confirmation, notes]);

    const confirmationStartTimeLabel = React.useMemo(() => {
      if (!confirmation) return selectedTimeLabel ?? "";
      const startRaw =
        pickFirstString(confirmation, [
          "startTime",
          "booking.startTime",
          "booking.start_time",
          "start",
          "booking.start",
        ]) ?? null;
      return startRaw ? formatStartTimeLabel(startRaw, timeFormat) : selectedTimeLabel ?? "";
    }, [confirmation, selectedTimeLabel, timeFormat]);

    if (!radixReady) {
      return <>{trigger}</>;
    }

    return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        centerInViewport
        overlayClassName={cn(
          "scheduling-dialog-overlay",
          resolvedTheme === "light" && "!bg-black/25",
          resolvedTheme === "dark" && "!bg-black/60",
          resolvedTheme === "color" && "!bg-black/40"
        )}
        className={cn(
          "scheduling-dialog-shell gap-0 fixed inset-y-0 right-0 w-full",
          "max-lg:data-[state=open]:animate-in max-lg:data-[state=closed]:animate-out",
          "max-lg:data-[state=closed]:slide-out-to-right max-lg:data-[state=open]:slide-in-from-right",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          "lg:inset-0 lg:flex lg:items-center lg:justify-center"
        )}
      >
        <DialogTitle className="sr-only">Schedule a meeting</DialogTitle>

        {/* Close button: fixed top-right of viewport, above overlay */}
        <DialogClose
          className="fixed right-4 top-4 z-[100] flex size-12 min-h-12 min-w-12 items-center justify-center rounded-sm border-0 bg-transparent text-foreground dark:text-white color:text-white opacity-90 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 focus:ring-offset-0 ring-0 ring-offset-0 scheduling-dialog-close lg:text-white"
          aria-label="Close"
        >
          <XIcon className="size-6 shrink-0 text-foreground dark:text-white color:text-white lg:text-white" />
        </DialogClose>

        {/* Main wrapper: same bg as page. Color mode uses literal value so it works in portal. */}
        <div
          data-slot="scheduling-panel"
          data-theme={resolvedTheme}
          className={cn(
            "relative flex min-h-screen max-h-[90vh] lg:min-h-0 lg:h-fit lg:max-h-[85vh] w-full max-w-full lg:max-w-[1000px] flex-col overflow-y-auto lg:overflow-x-visible lg:overflow-y-auto rounded-none lg:rounded-2xl border border-border dark:border-[oklch(30%_0.01_264)] color:border-[oklch(28%_0.035_165)] p-4 px-4 text-foreground",
            (step === "date" || step === "time") && "pb-[88px]",
            resolvedTheme === "color" && "!bg-[oklch(24%_0.035_165)]",
            step === "details" && "lg:w-fit",
            step === "confirm" && "!p-0 lg:max-w-[464px] pr-[56px]"
          )}
          style={
            resolvedTheme === "color"
              ? { backgroundColor: COLOR_THEME_BACKGROUND }
              : resolvedTheme === "dark"
                ? { backgroundColor: "oklch(20% 0.01 264)" }
                : { backgroundColor: "#ffffff" }
          }
        >
          {step === "confirm" ? (
            <div className="flex min-h-0 w-full flex-none lg:flex-1 lg:min-h-0 flex-col items-start p-4">
              <ConfirmStep
                name={name}
                email={email}
                guestEmail={guestEmail}
                formattedDate={formattedDateConfirm}
                notes={notes}
                formattedTimeZone={formattedTimeZone}
                startTimeLabel={confirmationStartTimeLabel}
                meetingUrl={confirmationMeetingUrl}
                rescheduleUrl={confirmationRescheduleUrl}
                cancelUrl={confirmationCancelUrl}
                googleCalendarUrl={confirmationGoogleCalendarUrl}
                outlookCalendarUrl={confirmationOutlookCalendarUrl}
                office365CalendarUrl={confirmationOffice365CalendarUrl}
                icsUrl={confirmationIcsUrl}
              />
            </div>
          ) : step === "date" || step === "time" ? (
            /* Stage 1: left panel | calendar | time slots */
            <div className="flex min-h-0 flex-none lg:flex-1 lg:min-h-0 flex-col gap-4 lg:flex-row lg:gap-4 max-w-full">
              <div
                data-slot="scheduling-left-panel"
                className="flex h-auto min-h-0 w-full flex-col text-foreground pt-1 lg:w-[236px] shrink-0"
                style={
                  resolvedTheme === "color"
                    ? { backgroundColor: COLOR_THEME_BACKGROUND }
                    : { backgroundColor: "transparent" }
                }
              >
                <Card className="flex flex-1 flex-col gap-0 border-0 bg-transparent pt-0 pb-0 shadow-none text-foreground">
                  <CardHeader className="scheduling-left-header mb-1 gap-0 space-y-0 pb-0 px-0 pt-0.5">
                    <div className="flex flex-col gap-5">
                      <CardTitle className="scheduling-left-title mt-0 shrink-0 text-subtitle1 font-medium text-foreground">
                        Introduction Call
                      </CardTitle>
                      <span className="scheduling-left-name block text-subtitle2 text-foreground">
                        Mike Marchitto
                      </span>
                    </div>
                    <p className="scheduling-left-desc mt-2 mb-4 text-body2 text-foreground">
                      A 30‑minute video call designed to introduce ourselves and explore where our work might align.
                    </p>
                  </CardHeader>
                  <CardContent className="scheduling-left-details flex flex-col gap-4 pt-0 px-0">
                    <div className="scheduling-left-detail-row flex items-center gap-2 text-body2 text-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>30 min</span>
                    </div>
                    <div className="scheduling-left-detail-row flex items-center gap-2 text-body2 text-foreground">
                      <Video className="h-4 w-4 shrink-0" />
                      <span>Video Call</span>
                    </div>
                    <DropdownMenu
                      onOpenChange={(open) => {
                        setTimezoneOpen(open);
                        if (open) {
                          setTimeout(() => {
                            selectedRef.current?.scrollIntoView({
                              block: "center",
                              behavior: "instant",
                            });
                          }, 0);
                        }
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          style={{ paddingTop: 8, paddingBottom: 8 }}
                          className="-ml-2 -mt-[6px] flex items-center gap-2 rounded-lg px-2 leading-normal text-body2 text-foreground transition-colors hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)]"
                        >
                          <Globe className="h-4 w-4 shrink-0" />
                          <span className="max-w-[180px] truncate">{formatTimezoneLabel(timeZone)}</span>
                          {timezoneOpen ? (
                            <ChevronUp className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)] max-h-[280px] overflow-y-auto color:bg-[oklch(24%_0.035_165)]"
                      >
                        {TIME_ZONES.map((tz) => (
                          <DropdownMenuItem
                            key={tz}
                            ref={tz === timeZone ? selectedRef : null}
                            onSelect={() => setTimeZone(tz)}
                            className={cn(
                              "flex items-center gap-2 rounded-sm py-2 pl-0.5 leading-normal hover:bg-[oklch(92%_0_0)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(48%_0.035_165)] focus:bg-[oklch(92%_0_0)] dark:focus:bg-[oklch(30%_0.01_264)] color:focus:bg-[oklch(48%_0.035_165)]",
                              timeZone === tz && "!bg-white !text-black dark:!bg-transparent dark:!text-white color:!bg-transparent color:!text-white"
                            )}
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                              {timeZone === tz ? (
                                <Check className="h-4 w-4" />
                              ) : null}
                            </span>
                            <span className="min-w-0 truncate">{formatTimezoneLabel(tz)}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </div>
              <div
                data-slot="scheduling-calendar-wrap"
                className="-mt-0.5 flex h-auto min-h-[280px] lg:min-h-0 min-w-0 flex-1 flex-none flex-col overflow-visible lg:w-[384px]"
                style={{ backgroundColor: "transparent" }}
              >
                <div className="flex min-w-0 flex-1 flex-col overflow-visible pt-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => handleDateSelect(newDate)}
                    defaultMonth={date}
                    className="rounded-none border-0 p-0 [--cell-size:2.25rem] lg:[--cell-size:3rem]"
                    classNames={{
                      caption_label:
                        "select-none text-subtitle1 text-foreground leading-8 h-8 flex items-center",
                      day: "relative w-full h-full p-0 text-center group/day aspect-square select-none",
                    }}
                    components={{ DayButton: SchedulingCalendarDayButton }}
                  />
                </div>
              </div>
              <div className="flex h-auto min-h-0 min-w-0 shrink-0 flex-col pt-0 w-full lg:w-[236px]">
                {step === "time" ? (
                  availabilityLoading ? (
                    <div className="flex flex-col min-h-0">
                      <div
                        data-slot="scheduling-right-header"
                        className="mb-2 flex items-center justify-between gap-2 rounded-none bg-transparent p-0"
                      >
                        <span className="text-subtitle1 text-foreground dark:text-white color:text-white">
                          {selectedLabel}
                        </span>
                      </div>
                      <div className="text-body2 text-foreground flex items-center gap-2 mt-4 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Loading available times...
                      </div>
                    </div>
                  ) : availabilityError ? (
                    <div className="flex flex-col min-h-0">
                      <div
                        data-slot="scheduling-right-header"
                        className="mb-2 flex items-center justify-between gap-2 rounded-none bg-transparent p-0"
                      >
                        <span className="text-subtitle1 text-foreground dark:text-white color:text-white">
                          {selectedLabel}
                        </span>
                      </div>
                      <p className="text-body2 text-red-500 mt-[38px]">{availabilityError}</p>
                    </div>
                  ) : (
                    <SelectStep
                      selectedLabel={selectedLabel}
                      timeFormat={timeFormat}
                      onTimeFormatChange={onTimeFormatChange}
                      slots={timeSlots}
                      onSlotSelect={handleTimeSelect}
                    />
                  )
                ) : (
                  <div className="flex flex-col min-h-0">
                    <div
                      data-slot="scheduling-right-header"
                      className="mb-2 flex items-center justify-between gap-2 rounded-none bg-transparent p-0"
                    >
                      <span className="text-subtitle1 text-foreground dark:text-white color:text-white">
                        {selectedLabel}
                      </span>
                    </div>
                    <p className="text-body2 text-foreground mt-[38px]">
                      Select a date to see available times.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Stage 2: left panel | details form */
            <div className="flex min-h-0 flex-none lg:flex-1 lg:min-h-0 flex-col gap-4 lg:flex-row lg:gap-4 max-w-full">
              <div
                data-slot="scheduling-left-panel"
                className="flex h-auto min-h-0 w-full flex-col text-foreground pt-1 lg:w-[236px] shrink-0"
                style={
                  resolvedTheme === "color"
                    ? { backgroundColor: COLOR_THEME_BACKGROUND }
                    : { backgroundColor: "transparent" }
                }
              >
                <Card className="flex flex-1 flex-col gap-0 border-0 bg-transparent pt-0 pb-0 shadow-none text-foreground">
                  <CardHeader className="scheduling-left-header mb-1 gap-0 space-y-0 pb-0 px-0 pt-0.5">
                    <div className="flex flex-col gap-5">
                      <CardTitle className="scheduling-left-title mt-0 shrink-0 text-subtitle1 font-medium text-foreground">
                        Introduction Call
                      </CardTitle>
                      <span className="scheduling-left-name block text-subtitle2 text-foreground">
                        Mike Marchitto
                      </span>
                    </div>
                    <p className="scheduling-left-desc mt-2 mb-4 text-body2 text-foreground">
                      A 30‑minute video call designed to introduce ourselves and explore where our work might align.
                    </p>
                  </CardHeader>
                  <CardContent className="scheduling-left-details flex flex-col gap-4 pt-0 px-0">
                    {formattedDateAtTime && (
                      <div className="scheduling-left-detail-row flex items-start gap-2 text-body2 text-foreground">
                        <CalendarIcon className="h-4 w-4 shrink-0 mt-[2px]" />
                        <span>{formattedDateAtTime}</span>
                      </div>
                    )}
                    <div className="scheduling-left-detail-row flex items-center gap-2 text-body2 text-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>30 min</span>
                    </div>
                    <div className="scheduling-left-detail-row flex items-center gap-2 text-body2 text-foreground">
                      <Video className="h-4 w-4 shrink-0" />
                      <span>Video Call</span>
                    </div>
                    <div className="scheduling-left-detail-row flex items-center gap-2 text-body2 text-foreground pointer-events-none">
                      <Globe className="h-4 w-4 shrink-0" />
                      <span className="max-w-[180px] truncate">{formatTimezoneLabel(timeZone)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex min-h-0 w-full flex-col pt-[2px] lg:w-[384px] shrink-0">
                <DetailsStep
                  name={name}
                  onNameChange={onNameChange}
                  email={email}
                  onEmailChange={onEmailChange}
                  notes={notes}
                  onNotesChange={onNotesChange}
                  showAddGuestInput={showAddGuestInput}
                  onToggleAddGuest={onToggleAddGuest}
                  guestEmail={guestEmail}
                  onGuestEmailChange={onGuestEmailChange}
                  onBack={onBack}
                  onConfirm={handleSubmit}
                  isSubmitting={bookingLoading}
                  submitError={bookingError}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    );
  };
} catch (err) {
  console.error("🔥 MODULE ERROR in scheduling-dialog:", err);
  throw err;
}

export { SchedulingDialog };
