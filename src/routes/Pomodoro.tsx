import { createSignal, onCleanup, onMount, For } from "solid-js";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-solid";
import { getStoreValue } from "@/config/store";
import { playChime } from "@/config/sounds";
import useTickingSound from "@/hooks/useTickingSound";

type Config = { pomodoroTimeSeconds: number; shortBreakTimeSeconds: number; longBreakTimeSeconds: number; numberOfRounds: number };
const defaults: Config = { pomodoroTimeSeconds: 1500, shortBreakTimeSeconds: 300, longBreakTimeSeconds: 900, numberOfRounds: 4 };
const fmt =(seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function Pomodoro() {
  const [config, setConfig] = createSignal(defaults);
  const [mode, setMode] = createSignal<"focus" | "short" | "long">("focus");
  const [left, setLeft] = createSignal(defaults.pomodoroTimeSeconds);
  const [running, setRunning] = createSignal(false);
  const [sessions, setSessions] = createSignal(0);
  const { muted, toggleMuted } = useTickingSound(left, running);
  let end = 0;
  let tick: number | undefined;

  const duration = () => mode() === "focus" ? config().pomodoroTimeSeconds : mode() === "short" ? config().shortBreakTimeSeconds : config().longBreakTimeSeconds;
  const choose = (nextMode: "focus" | "short" | "long") => {
    clearInterval(tick); setRunning(false); setMode(nextMode);
    setLeft(nextMode === "focus" ? config().pomodoroTimeSeconds : nextMode === "short" ? config().shortBreakTimeSeconds : config().longBreakTimeSeconds);
  };
  const rounds = () => config().numberOfRounds;
  const skipNext = () => {
    if (mode() === "focus") { const next = sessions() + 1; setSessions(next); choose(next % rounds() === 0 ? "long" : "short"); }
    else choose("focus");
  };
  const skipPrev = () => {
    if (mode() === "focus") { if (sessions() === 0) return; choose(sessions() % rounds() === 0 ? "long" : "short"); }
    else { setSessions((value) => Math.max(0, value - 1)); choose("focus"); }
  };
  const stop = () => { clearInterval(tick); setRunning(false); setLeft(duration()); };
  const update = () => {
    const next = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    setLeft(next);
    if (next) return;
    clearInterval(tick); setRunning(false);
    if (mode() === "focus") {
      const nextSession = sessions() + 1; setSessions(nextSession);
      const roundComplete = nextSession % config().numberOfRounds === 0;
      playChime(roundComplete ? "sessionsComplete" : "focusDone");
      choose(roundComplete ? "long" : "short");
    } else {
      playChime(mode() === "long" ? "longBreakDone" : "breakDone");
      choose("focus");
    }
  };
  onMount(async () => {
    const stored = (await getStoreValue<Config>("pomodoro-settings")) || defaults;
    setConfig(stored); setLeft(stored.pomodoroTimeSeconds);
  });
  onCleanup(() => clearInterval(tick));
  const toggle = () => {
    if (running()) { clearInterval(tick); setRunning(false); }
    else { end = Date.now() + left() * 1000; tick = window.setInterval(update, 250); setRunning(true); }
  };
  const label = () => mode() === "focus" ? "Focus session" : mode() === "short" ? "Short break" : "Long break";

  return <section class="page pomodoro"><div>
    <div class="tabs"><button class={mode() === "focus" ? "active" : ""} onClick={() => choose("focus")}>Focus<br />{config().pomodoroTimeSeconds / 60}</button><button class={mode() === "short" ? "active" : ""} onClick={() => choose("short")}>Short break<br />{config().shortBreakTimeSeconds / 60}</button><button class={mode() === "long" ? "active" : ""} onClick={() => choose("long")}>Long break<br />{config().longBreakTimeSeconds / 60}</button></div>
    <div class="clock-face"><div class="clock-content"><p class="eyebrow">{label()}</p><div class="time">{fmt(left())}</div><p class="date">{mode() === "focus" ? "Stay with one task" : "Take a breath"}</p></div><button class="clock-sound-toggle" type="button" aria-label={muted() ? "Unmute clock ticking" : "Mute clock ticking"} aria-pressed={muted()} onClick={toggleMuted}>{muted() ? <VolumeX /> : <Volume2 />}</button></div>
    <div class="pomodoro-actions"><button class="button primary" onClick={toggle}>{running() ? <Pause /> : <Play fill="currentColor" />}{running() ? "Pause" : "Start"}</button><button class="button" onClick={stop}><RotateCcw />Reset</button></div>
  </div><aside class="panel today"><h2>Today</h2><div class="session-count">{sessions()} <span class="muted">/ {config().numberOfRounds} <small>sessions</small></span></div><div class="dots"><For each={Array.from({ length: config().numberOfRounds })}>{(_, index) => <i class={index() < sessions() ? "done" : ""} />}</For></div><hr class="section-rule" /><span class="muted">Focus time</span><h2>{Math.round(sessions() * config().pomodoroTimeSeconds / 60)} min</h2><hr class="section-rule" /><span class="muted">Phase controls</span><div class="phase-controls"><button class="button" aria-label="Previous phase" onClick={skipPrev}><ChevronLeft /></button><button class="button" aria-label="Stop" onClick={stop}><Square /></button><button class="button" aria-label="Next phase" onClick={skipNext}><ChevronRight /></button></div></aside></section>;
}
