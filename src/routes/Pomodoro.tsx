import { createSignal, onCleanup, onMount, For } from "solid-js";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-solid";
import { getStoreValue, setStoreValue } from "@/config/store";
import useTickingSound from "@/hooks/useTickingSound";

type Config = { pomodoroTimeSeconds: number; shortBreakTimeSeconds: number; longBreakTimeSeconds: number; numberOfRounds: number };
const defaults: Config = { pomodoroTimeSeconds: 1500, shortBreakTimeSeconds: 300, longBreakTimeSeconds: 900, numberOfRounds: 4 };
const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function Pomodoro() {
  const [config, setConfig] = createSignal(defaults);
  const [mode, setMode] = createSignal<"focus" | "short" | "long">("focus");
  const [left, setLeft] = createSignal(defaults.pomodoroTimeSeconds);
  const [running, setRunning] = createSignal(false);
  const [task, setTask] = createSignal("");
  const [sessions, setSessions] = createSignal(0);
  const { muted, toggleMuted } = useTickingSound(left, running);
  let end = 0;
  let tick: number | undefined;

  const duration = () => mode() === "focus" ? config().pomodoroTimeSeconds : mode() === "short" ? config().shortBreakTimeSeconds : config().longBreakTimeSeconds;
  const choose = (nextMode: "focus" | "short" | "long") => {
    clearInterval(tick); setRunning(false); setMode(nextMode);
    setLeft(nextMode === "focus" ? config().pomodoroTimeSeconds : nextMode === "short" ? config().shortBreakTimeSeconds : config().longBreakTimeSeconds);
  };
  const update = () => {
    const next = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    setLeft(next);
    if (!next) {
      clearInterval(tick); setRunning(false);
      if (mode() === "focus") { const nextSession = sessions() + 1; setSessions(nextSession); choose(nextSession % config().numberOfRounds === 0 ? "long" : "short"); }
      else choose("focus");
    }
  };
  onMount(async () => {
    const stored = (await getStoreValue<Config>("pomodoro-settings")) || defaults;
    setConfig(stored); setLeft(stored.pomodoroTimeSeconds);
    setTask((await getStoreValue<string>("pomodoro-task")) || "");
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
    <div class="pomodoro-actions"><button class="button primary" onClick={toggle}>{running() ? <Pause /> : <Play fill="currentColor" />}{running() ? "Pause" : "Start"}</button><button class="button" onClick={() => { clearInterval(tick); setRunning(false); setLeft(duration()); }}><RotateCcw />Reset</button></div>
  </div><aside class="panel today"><h2>Today</h2><div class="session-count">{sessions()} <span class="muted">/ {config().numberOfRounds} <small>sessions</small></span></div><div class="dots"><For each={Array.from({ length: config().numberOfRounds })}>{(_, index) => <i class={index() < sessions() ? "done" : ""} />}</For></div><hr class="section-rule" /><span class="muted">Focus time</span><h2>{Math.round(sessions() * config().pomodoroTimeSeconds / 60)} min</h2><hr class="section-rule" /><label class="muted">Current task</label><input class="task-input" value={task()} onInput={(event) => { setTask(event.currentTarget.value); void setStoreValue("pomodoro-task", event.currentTarget.value); }} placeholder="What are you working on?" /><hr class="section-rule" /><strong>Next: <span class="muted">{mode() === "focus" ? "Short break" : "Focus"}</span></strong></aside></section>;
}
