import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Volume2, VolumeX } from "lucide-solid";
import useTickingSound from "@/hooks/useTickingSound";
import { focusMode, setFocusMode } from "@/config/focusMode";
import { dayPeriod, formatDate, formatSeconds, formatTime, showSeconds, timeZoneLabel } from "@/config/clockSettings";

export default function Home() {
  const [now, setNow] = createSignal(new Date());
  const { muted, toggleMuted } = useTickingSound(() => now().getSeconds(), () => true);
  let timeout: number | undefined;
  const schedule = () => { clearTimeout(timeout); if (!document.hidden) timeout = window.setTimeout(() => { setNow(new Date()); schedule(); }, 1000 - Date.now() % 1000 + 8); };
  onMount(() => {
    const visible = () => { if (!document.hidden) setNow(new Date()); schedule(); };
    document.addEventListener("visibilitychange", visible);
    schedule();
    onCleanup(() => { clearTimeout(timeout); document.removeEventListener("visibilitychange", visible); });
  });
  const time = () => formatTime(now());
  const seconds = () => formatSeconds(now());
  const period = () => dayPeriod(now());
  const date = () => formatDate(now());
  const zone = () => timeZoneLabel(now());
  return <section class="page home">
    <div class="home-clock-stage">
      <div class="clock-face home-clock">
        <div class="clock-content home-clock-content">
          <p class="eyebrow">Local time</p>
          <div class="time" aria-label={`${time()}${showSeconds() ? ` and ${seconds()} seconds` : ""}${period() ? ` ${period()}` : ""}`}>
            <span class="time-primary">{time()}</span>
            <Show when={showSeconds()}><span class="seconds">:{seconds()}</span></Show>
            <Show when={period()}><span class="day-period">{period()}</span></Show>
          </div>
          <Show when={date()}><div class="home-date-stack"><p class="date">{date()}</p><span class="muted">{zone()}</span></div></Show>
        </div>
        <button class="clock-sound-toggle clock-focus-toggle" type="button" aria-label={focusMode() ? "Exit focus mode" : "Enter focus mode"} aria-pressed={focusMode()} aria-keyshortcuts="P" title="Toggle focus mode (P)" onClick={() => setFocusMode((active) => !active)}>P</button>
        <button class="clock-sound-toggle" type="button" aria-label={muted() ? "Unmute clock ticking" : "Mute clock ticking"} aria-pressed={muted()} onClick={toggleMuted}>{muted() ? <VolumeX /> : <Volume2 />}</button>
      </div>
    </div>
  </section>;
}
