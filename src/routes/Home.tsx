import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { ArrowRight, Crosshair } from "lucide-solid";

export default function Home() {
  const [now, setNow] = createSignal(new Date());
  const [immersive, setImmersive] = createSignal(false);
  let timeout: number | undefined;
  const schedule = () => { clearTimeout(timeout); if (!document.hidden) timeout = window.setTimeout(() => { setNow(new Date()); schedule(); }, 1000 - Date.now() % 1000 + 8); };
  createEffect(() => document.documentElement.classList.toggle("focus-mode", immersive()));
  onMount(() => {
    const visible = () => { if (!document.hidden) setNow(new Date()); schedule(); };
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.code === "KeyP" && !event.repeat) { event.preventDefault(); setImmersive(value => !value); }
      if (event.key === "Escape" && immersive()) { event.preventDefault(); setImmersive(false); }
    };
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("keydown", keyboard);
    schedule();
    onCleanup(() => { clearTimeout(timeout); document.removeEventListener("visibilitychange", visible); window.removeEventListener("keydown", keyboard); document.documentElement.classList.remove("focus-mode"); });
  });
  const time = () => now().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", hour12:false });
  const seconds = () => String(now().getSeconds()).padStart(2, "0");
  const date = () => now().toLocaleDateString([], { weekday:"long", month:"long", day:"numeric" });
  return <section class="page home">
    <div class="clock-face home-clock">
      <div class="clock-content home-clock-content">
        <p class="eyebrow">Local time</p>
        <div class="time" aria-label={`${time()} and ${seconds()} seconds`}><span class="time-primary">{time()}</span><span class="seconds">:{seconds()}</span></div>
        <div class="home-date-stack"><p class="date">{date()}</p><span class="muted">Local timezone</span></div>
      </div>
    </div>
    <div class="home-actions"><button type="button" class="home-cta" aria-pressed={immersive()} onClick={() => setImmersive(true)}><Crosshair size={25}/><span>Start a focus session</span><span class="round-button"><ArrowRight/></span></button><span class="home-hint muted">Press <kbd>P</kbd> for focus mode</span></div>
    <span class="focus-exit-hint" aria-hidden={!immersive()}>Press <kbd>P</kbd> or <kbd>Esc</kbd> to exit focus</span>
  </section>;
}
