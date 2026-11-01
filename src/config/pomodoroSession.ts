import { createSignal } from "solid-js";
import { getStoreValue, setStoreValue } from "@/config/store";
import { playChime } from "@/config/sounds";

export type PomodoroConfig = { pomodoroTimeSeconds: number; shortBreakTimeSeconds: number; longBreakTimeSeconds: number; numberOfRounds: number };
type Mode = "focus" | "short" | "long";
type SavedSession = { mode: Mode; left: number; running: boolean; sessions: number; laps: number; endAt: number };
const defaults: PomodoroConfig = { pomodoroTimeSeconds: 1500, shortBreakTimeSeconds: 300, longBreakTimeSeconds: 900, numberOfRounds: 4 };
const KEY = "pomodoro-session";

export const [config, setConfig] = createSignal(defaults);
export const [mode, setMode] = createSignal<Mode>("focus");
export const [left, setLeft] = createSignal(defaults.pomodoroTimeSeconds);
export const [running, setRunning] = createSignal(false);
export const [sessions, setSessions] = createSignal(0);
export const [laps, setLaps] = createSignal(0);
let endAt = 0;
let loaded: Promise<void> | undefined;
let pendingWrite = Promise.resolve();

export const duration = () => mode() === "focus" ? config().pomodoroTimeSeconds : mode() === "short" ? config().shortBreakTimeSeconds : config().longBreakTimeSeconds;
const persist = () => {
  const snapshot: SavedSession = { mode: mode(), left: left(), running: running(), sessions: sessions(), laps: laps(), endAt };
  pendingWrite = pendingWrite.then(() => setStoreValue(KEY, snapshot)).catch(console.error);
  return pendingWrite;
};

const advanceOne = (notify: boolean) => {
  if (mode() === "focus") {
    const next = sessions() + 1;
    setSessions(next);
    const roundComplete = next % config().numberOfRounds === 0;
    if (roundComplete) setLaps(value => value + 1);
    if (notify) playChime(roundComplete ? "sessionsComplete" : "focusDone");
    setMode(roundComplete ? "long" : "short");
  } else {
    const wasLong = mode() === "long";
    if (notify) playChime(wasLong ? "longBreakDone" : "breakDone");
    if (wasLong) setSessions(0);
    setMode("focus");
  }
  setLeft(duration());
};

export const refreshPomodoroSession = () => {
  if (!running()) return;
  const time = Date.now();
  let changedPhase = false;
  while (time >= endAt) {
    // Catch up silently after a long suspension; a current boundary still chimes.
    advanceOne(time - endAt < 1000 && !document.hidden);
    endAt += duration() * 1000;
    changedPhase = true;
  }
  setLeft(Math.max(0, Math.ceil((endAt - time) / 1000)));
  if (changedPhase) void persist();
};

export const initPomodoroSession = () => {
  if (!loaded) loaded = Promise.all([
    getStoreValue<PomodoroConfig>("pomodoro-settings"),
    getStoreValue<SavedSession>(KEY),
  ]).then(([settings, saved]) => {
    const source = settings || defaults;
    setConfig({
      pomodoroTimeSeconds: Math.max(1, source.pomodoroTimeSeconds || defaults.pomodoroTimeSeconds),
      shortBreakTimeSeconds: Math.max(1, source.shortBreakTimeSeconds || defaults.shortBreakTimeSeconds),
      longBreakTimeSeconds: Math.max(1, source.longBreakTimeSeconds || defaults.longBreakTimeSeconds),
      numberOfRounds: Math.max(1, Math.floor(source.numberOfRounds || defaults.numberOfRounds)),
    });
    if (saved) {
      setMode(saved.mode);
      setLeft(saved.left);
      setRunning(saved.running && saved.endAt > 0);
      setSessions(saved.sessions);
      setLaps(saved.laps);
      endAt = saved.endAt;
    } else setLeft(config().pomodoroTimeSeconds);
    refreshPomodoroSession();
    if (typeof window !== "undefined") {
      window.setInterval(refreshPomodoroSession, 250);
      window.addEventListener("focus", refreshPomodoroSession);
      document.addEventListener("visibilitychange", refreshPomodoroSession);
    }
  }).catch(error => { loaded = undefined; throw error; });
  return loaded;
};

export const reloadPomodoroSettings = async () => {
  await initPomodoroSession();
  const saved = await getStoreValue<PomodoroConfig>("pomodoro-settings");
  if (!saved) return;
  const previousDuration = duration();
  setConfig({
    pomodoroTimeSeconds: Math.max(1, saved.pomodoroTimeSeconds || defaults.pomodoroTimeSeconds),
    shortBreakTimeSeconds: Math.max(1, saved.shortBreakTimeSeconds || defaults.shortBreakTimeSeconds),
    longBreakTimeSeconds: Math.max(1, saved.longBreakTimeSeconds || defaults.longBreakTimeSeconds),
    numberOfRounds: Math.max(1, Math.floor(saved.numberOfRounds || defaults.numberOfRounds)),
  });
  if (!running() && left() === previousDuration) setLeft(duration());
  void persist();
};

export const chooseMode = (next: Mode) => {
  setMode(next);
  setLeft(duration());
  if (running()) endAt = Date.now() + left() * 1000;
  void persist();
};
export const skipNext = () => {
  advanceOne(true);
  if (running()) endAt = Date.now() + duration() * 1000;
  void persist();
};
export const skipPrevious = () => {
  playChime(mode() === "focus" ? "focusDone" : mode() === "long" ? "longBreakDone" : "breakDone");
  if (mode() === "short") { setSessions(value => Math.max(0, value - 1)); chooseMode("focus"); return; }
  if (mode() === "long") { setLaps(value => Math.max(0, value - 1)); setSessions(Math.max(0, config().numberOfRounds - 1)); chooseMode("focus"); return; }
  if (sessions() > 0) { chooseMode(sessions() % config().numberOfRounds === 0 ? "long" : "short"); return; }
  if (laps() > 0) { setSessions(config().numberOfRounds); chooseMode("long"); }
};
export const stop = () => { setRunning(false); endAt = 0; setLeft(duration()); void persist(); };
export const reset = () => { stop(); setLaps(0); setSessions(0); setMode("focus"); setLeft(duration()); void persist(); };
export const pause = () => {
  if (!running()) return;
  refreshPomodoroSession();
  setRunning(false);
  endAt = 0;
  void persist();
};
export const toggle = () => {
  if (running()) pause();
  else {
    if (left() <= 0) setLeft(duration());
    endAt = Date.now() + left() * 1000;
    setRunning(true);
    void persist();
  }
};
