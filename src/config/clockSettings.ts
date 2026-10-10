import { createSignal } from "solid-js";
import { getStoreValue, setStoreValue } from "@/config/store";

export type HourFormat = "24" | "12";
export type DateStyle = "full" | "compact" | "numeric" | "off";

export const hourFormats: { id: HourFormat; label: string }[] = [
  { id: "24", label: "24-hour" },
  { id: "12", label: "12-hour" },
];

export const dateStyles: { id: DateStyle; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "compact", label: "Compact" },
  { id: "numeric", label: "Numeric" },
  { id: "off", label: "Off" },
];

const [hourFormat, setHourFormatSignal] = createSignal<HourFormat>("24");
const [showSeconds, setShowSecondsSignal] = createSignal(true);
const [padHour, setPadHourSignal] = createSignal(true);
const [dateStyle, setDateStyleSignal] = createSignal<DateStyle>("full");

export { hourFormat, showSeconds, padHour, dateStyle };

let loaded = false;
export const loadClockSettings = async () => {
  if (loaded) return;
  const [storedFormat, storedSeconds, storedPad, storedDate] = await Promise.all([
    getStoreValue<HourFormat>("clockHourFormat"),
    getStoreValue<boolean>("clockShowSeconds"),
    getStoreValue<boolean>("clockPadHour"),
    getStoreValue<DateStyle>("clockDateStyle"),
  ]);
  if (storedFormat) setHourFormatSignal(storedFormat);
  if (storedSeconds !== null) setShowSecondsSignal(storedSeconds);
  if (storedPad !== null) setPadHourSignal(storedPad);
  if (storedDate) setDateStyleSignal(storedDate);
  loaded = true;
};

export const setHourFormat = (value: HourFormat) => { setHourFormatSignal(value); void setStoreValue("clockHourFormat", value); };
export const setShowSeconds = (value: boolean) => { setShowSecondsSignal(value); void setStoreValue("clockShowSeconds", value); };
export const setPadHour = (value: boolean) => { setPadHourSignal(value); void setStoreValue("clockPadHour", value); };
export const setDateStyle = (value: DateStyle) => { setDateStyleSignal(value); void setStoreValue("clockDateStyle", value); };

export const formatTime = (date: Date) => {
  const raw = date.getHours();
  const hour = hourFormat() === "12" ? (raw % 12 || 12) : raw;
  const hourText = padHour() ? String(hour).padStart(2, "0") : String(hour);
  return `${hourText}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export const formatSeconds = (date: Date) => String(date.getSeconds()).padStart(2, "0");

export const dayPeriod = (date: Date) => hourFormat() === "12" ? (date.getHours() < 12 ? "AM" : "PM") : "";

export const timeZoneLabel = (date: Date) => {
  try {
    const named = new Intl.DateTimeFormat([], { timeZoneName: "long" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value;
    if (named) return named;
  } catch { /* fall through to IANA name */ }
  return Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ");
};

export const formatDate = (date: Date) => {
  switch (dateStyle()) {
    case "off": return "";
    case "compact": return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    case "numeric": return date.toLocaleDateString();
    default: return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  }
};
