import { For, onMount } from "solid-js";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-solid";
import { selectSession } from "@/config/sessionControls";
import useTickingSound from "@/hooks/useTickingSound";
import ClockRing from "@/components/ClockRing";
import {
  config, mode, left, running, sessions, laps, duration,
  chooseMode, skipNext, skipPrevious, stop, reset, pause, toggle, reloadPomodoroSettings,
  refreshPomodoroSession,
} from "@/config/pomodoroSession";

const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function Pomodoro() {
  const { muted, toggleMuted } = useTickingSound(left, running);
  onMount(() => {
    void reloadPomodoroSettings().then(() => {
      refreshPomodoroSession();
      selectSession("pomodoro", { "play-pause": toggle, stop, reset, next: skipNext, previous: skipPrevious, pause });
    }).catch(console.error);
  });
  const label = () => mode() === "focus" ? "Focus session" : mode() === "short" ? "Short break" : "Long break";
  const focusMinutes = () => Math.round(((laps() - (mode() === "long" ? 1 : 0)) * config().numberOfRounds + sessions()) * config().pomodoroTimeSeconds / 60);

  return <section class="page pomodoro"><div>
    <div class="tabs">
      <button class={mode() === "focus" ? "active" : ""} onClick={() => chooseMode("focus")}>Focus<br />{config().pomodoroTimeSeconds / 60}</button>
      <button class={mode() === "short" ? "active" : ""} onClick={() => chooseMode("short")}>Short break<br />{config().shortBreakTimeSeconds / 60}</button>
      <button class={mode() === "long" ? "active" : ""} onClick={() => chooseMode("long")}>Long break<br />{config().longBreakTimeSeconds / 60}</button>
    </div>
    <div class="clock-face">
      <div class="clock-halo" aria-hidden="true" />
      <ClockRing progress={duration() ? left() / duration() : 0} />
      <div class="clock-content"><p class="eyebrow">{label()}</p><div class="time">{fmt(left())}</div><p class="date">{mode() === "focus" ? "Stay with one task" : "Take a breath"}</p></div>
      <button class="clock-sound-toggle" type="button" aria-label={muted() ? "Unmute clock ticking" : "Mute clock ticking"} aria-pressed={muted()} onClick={toggleMuted}>{muted() ? <VolumeX /> : <Volume2 />}</button>
    </div>
    <div class="pomodoro-actions"><button class="button primary" onClick={toggle}>{running() ? <Pause /> : <Play fill="currentColor" />}{running() ? "Pause" : "Start"}</button><button class="button" onClick={reset}><RotateCcw />Reset</button></div>
  </div><aside class="panel today">
    {laps() > 0 && <span class="lap-badge">{laps()} {laps() === 1 ? "lap" : "laps"}</span>}
    <h2>Today</h2>
    <div class="session-count">{sessions()} <span class="muted">/ {config().numberOfRounds} <small>sessions</small></span></div>
    <div class="dots"><For each={Array.from({ length: config().numberOfRounds })}>{(_, index) => <i class={index() < sessions() ? "done" : ""} />}</For></div>
    <hr class="section-rule" /><span class="muted">Focus time</span><h2>{focusMinutes()} min</h2>
    <hr class="section-rule" /><span class="muted">Phase controls</span>
    <div class="phase-controls"><button class="button" aria-label="Previous phase" onClick={skipPrevious}><ChevronLeft /></button><button class="button" aria-label="Stop" onClick={stop}><Square /></button><button class="button" aria-label="Next phase" onClick={skipNext}><ChevronRight /></button></div>
  </aside></section>;
}
