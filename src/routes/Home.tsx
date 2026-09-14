import { createSignal, onCleanup, onMount } from "solid-js";
import { A } from "@solidjs/router";
import { ArrowRight, Crosshair } from "lucide-solid";

export default function Home() {
  const [now, setNow] = createSignal(new Date()); let timeout: number | undefined;
  const schedule = () => { clearTimeout(timeout); if (!document.hidden) timeout = window.setTimeout(() => { setNow(new Date()); schedule(); }, 1000 - Date.now() % 1000 + 8); };
  onMount(() => { const visible = () => { if (!document.hidden) setNow(new Date()); schedule(); }; document.addEventListener("visibilitychange", visible); schedule(); onCleanup(() => { clearTimeout(timeout); document.removeEventListener("visibilitychange", visible); }); });
  const time = () => now().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", hour12:false });
  const seconds = () => now().toLocaleTimeString([], { second:"2-digit" });
  const date = () => now().toLocaleDateString([], { weekday:"long", month:"long", day:"numeric" });
  return <section class="page home"><div class="clock-face"><div class="clock-content"><p class="eyebrow">Local time</p><div class="time">{time()}<span class="seconds">:{seconds()}</span></div><p class="date">{date()}</p><span class="muted">Local timezone</span></div></div><A class="home-cta" href="/pomodoro"><Crosshair size={27}/>Start a focus session <span class="round-button"><ArrowRight/></span></A><span class="muted">Press <kbd>P</kbd> for Pomodoro</span></section>;
}
