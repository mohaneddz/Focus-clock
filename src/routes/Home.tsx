import { createSignal, onCleanup, onMount } from "solid-js";
import { ArrowRight, Crosshair, Volume2, VolumeX } from "lucide-solid";
import useTickingSound from "@/hooks/useTickingSound";
import { focusMode, setFocusMode } from "@/config/focusMode";

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
  const time = () => now().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", hour12:false });
  const seconds = () => String(now().getSeconds()).padStart(2, "0");
  const date = () => now().toLocaleDateString([], { weekday:"long", month:"long", day:"numeric" });
  return <section class="page home">
    <div class="home-clock-stage">
      <div class="clock-face home-clock">
        <div class="clock-content home-clock-content">
          <p class="eyebrow">Local time</p>
          <div class="time" aria-label={`${time()} and ${seconds()} seconds`}><span class="time-primary">{time()}</span><span class="seconds">:{seconds()}</span></div>
          <div class="home-date-stack"><p class="date">{date()}</p><span class="muted">Local timezone</span></div>
        </div>
        <button class="clock-sound-toggle clock-focus-toggle" type="button" aria-label={focusMode() ? "Exit focus mode" : "Enter focus mode"} aria-pressed={focusMode()} aria-keyshortcuts="P" title="Toggle focus mode (P)" onClick={() => setFocusMode((active) => !active)}>P</button>
        <button class="clock-sound-toggle" type="button" aria-label={muted() ? "Unmute clock ticking" : "Mute clock ticking"} aria-pressed={muted()} onClick={toggleMuted}>{muted() ? <VolumeX /> : <Volume2 />}</button>
      </div>
    </div>
    <div class="home-actions"><button type="button" class="home-cta" aria-pressed={focusMode()} onClick={() => setFocusMode(true)}><Crosshair size={25}/><span>Start a focus session</span><span class="round-button"><ArrowRight/></span></button></div>
  </section>;
}
