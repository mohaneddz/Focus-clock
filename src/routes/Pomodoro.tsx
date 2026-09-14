import { createSignal, onMount, For } from "solid-js";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-solid";
import { getStoreValue } from "@/config/store";
import { playChime } from "@/config/sounds";
import useTickingSound from "@/hooks/useTickingSound";
import ClockRing from "@/components/ClockRing";

type Config = { pomodoroTimeSeconds: number; shortBreakTimeSeconds: number; longBreakTimeSeconds: number; numberOfRounds: number };
const defaults: Config = { pomodoroTimeSeconds: 1500, shortBreakTimeSeconds: 300, longBreakTimeSeconds: 900, numberOfRounds: 4 };
const fmt =(seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

// Module-level state so the running session survives navigating to another
// route and back (e.g. Pomodoro -> Settings -> Pomodoro) instead of resetting.
const [config, setConfig] = createSignal(defaults);
const [mode, setMode] = createSignal<"focus" | "short" | "long">("focus");
const [left, setLeft] = createSignal(defaults.pomodoroTimeSeconds);
const [running, setRunning] = createSignal(false);
const [sessions, setSessions] = createSignal(0);
const [laps, setLaps] = createSignal(0);
let end = 0;
let tick: number | undefined;
let settingsLoaded = false;

export default function Pomodoro() {
  const { muted, toggleMuted } = useTickingSound(left, running);

  const duration = () => mode() === "focus" ? config().pomodoroTimeSeconds : mode() === "short" ? config().shortBreakTimeSeconds : config().longBreakTimeSeconds;
  const choose = (nextMode: "focus" | "short" | "long") => {
    clearInterval(tick); setRunning(false); setMode(nextMode);
    setLeft(nextMode === "focus" ? config().pomodoroTimeSeconds : nextMode === "short" ? config().shortBreakTimeSeconds : config().longBreakTimeSeconds);
  };
  const rounds = () => config().numberOfRounds;
  const finishFocus = () => {
    const next = sessions() + 1; setSessions(next);
    const roundComplete = next % rounds() === 0;
    if (roundComplete) setLaps((value) => value + 1);
    return roundComplete;
  };
  const skipNext = () => {
    if (mode() === "focus") { const roundComplete = finishFocus(); playChime(roundComplete ? "sessionsComplete" : "focusDone"); choose(roundComplete ? "long" : "short"); }
    else { const wasLong = mode() === "long"; playChime(wasLong ? "longBreakDone" : "breakDone"); if (wasLong) setSessions(0); choose("focus"); }
  };
  const skipPrev = () => {
    playChime(mode() === "focus" ? "focusDone" : mode() === "long" ? "longBreakDone" : "breakDone");
    if (mode() === "short") { setSessions((value) => Math.max(0, value - 1)); choose("focus"); return; }
    if (mode() === "long") { setLaps((value) => Math.max(0, value - 1)); setSessions(Math.max(0, rounds() - 1)); choose("focus"); return; }
    if (sessions() > 0) { choose(sessions() % rounds() === 0 ? "long" : "short"); return; }
    if (laps() > 0) { setSessions(rounds()); choose("long"); }
  };
  const stop = () => { clearInterval(tick); setRunning(false); setLeft(duration()); };
  const reset = () => { setLaps(0); setSessions(0); choose("focus"); };
  const update = () => {
    const next = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    setLeft(next);
    if (next) return;
    clearInterval(tick); setRunning(false);
    if (mode() === "focus") {
      const roundComplete = finishFocus();
      playChime(roundComplete ? "sessionsComplete" : "focusDone");
      choose(roundComplete ? "long" : "short");
    } else {
      const wasLong = mode() === "long";
      playChime(wasLong ? "longBreakDone" : "breakDone");
      if (wasLong) setSessions(0);
      choose("focus");
    }
  };
  onMount(async () => {
    const stored = (await getStoreValue<Config>("pomodoro-settings")) || defaults;
    setConfig(stored);
    if (!settingsLoaded) { setLeft(stored.pomodoroTimeSeconds); settingsLoaded = true; }
  });
  const toggle = () => {
    if (running()) { clearInterval(tick); setRunning(false); }
    else { end = Date.now() + left() * 1000; tick = window.setInterval(update, 250); setRunning(true); }
  };
  const label = () => mode() === "focus" ? "Focus session" : mode() === "short" ? "Short break" : "Long break";

  return <section class="page pomodoro"><div>
    <div class="tabs"><button class={mode() === "focus" ? "active" : ""} onClick={() => choose("focus")}>Focus<br />{config().pomodoroTimeSeconds / 60}</button><button class={mode() === "short" ? "active" : ""} onClick={() => choose("short")}>Short break<br />{config().shortBreakTimeSeconds / 60}</button><button class={mode() === "long" ? "active" : ""} onClick={() => choose("long")}>Long break<br />{config().longBreakTimeSeconds / 60}</button></div>
    <div class="clock-face"><ClockRing progress={duration() ? left() / duration() : 0} /><div class="clock-content"><p class="eyebrow">{label()}</p><div class="time">{fmt(left())}</div><p class="date">{mode() === "focus" ? "Stay with one task" : "Take a breath"}</p></div><button class="clock-sound-toggle" type="button" aria-label={muted() ? "Unmute clock ticking" : "Mute clock ticking"} aria-pressed={muted()} onClick={toggleMuted}>{muted() ? <VolumeX /> : <Volume2 />}</button></div>
    <div class="pomodoro-actions"><button class="button primary" onClick={toggle}>{running() ? <Pause /> : <Play fill="currentColor" />}{running() ? "Pause" : "Start"}</button><button class="button" onClick={reset}><RotateCcw />Reset</button></div>
  </div><aside class="panel today">{laps() > 0 && <span class="lap-badge">{laps()} {laps() === 1 ? "lap" : "laps"}</span>}<h2>Today</h2><div class="session-count">{sessions()} <span class="muted">/ {config().numberOfRounds} <small>sessions</small></span></div><div class="dots"><For each={Array.from({ length: config().numberOfRounds })}>{(_, index) => <i class={index() < sessions() ? "done" : ""} />}</For></div><hr class="section-rule" /><span class="muted">Focus time</span><h2>{Math.round((laps() * rounds() + sessions()) * config().pomodoroTimeSeconds / 60)} min</h2><hr class="section-rule" /><span class="muted">Phase controls</span><div class="phase-controls"><button class="button" aria-label="Previous phase" onClick={skipPrev}><ChevronLeft /></button><button class="button" aria-label="Stop" onClick={stop}><Square /></button><button class="button" aria-label="Next phase" onClick={skipNext}><ChevronRight /></button></div></aside></section>;
}
