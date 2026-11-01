import { createSignal } from "solid-js";
import { getStoreValue, setStoreValue } from "@/config/store";

export type TimerData = { id: number; title: string; duration: number };
export type TimerSession = TimerData & { remaining: number; running: boolean; endAt: number | null };

const KEY = "timer-sessions";
const [sessions, setSessions] = createSignal<Record<number, TimerSession>>({});
const [now, setNow] = createSignal(Date.now());
let loaded: Promise<void> | undefined;
let ticker: number | undefined;
let pendingWrite = Promise.resolve();
let pendingHistory = Promise.resolve();

const remainingAt = (session: TimerSession, time: number) =>
  session.running && session.endAt !== null
    ? Math.max(0, Math.ceil((session.endAt - time) / 1000))
    : session.remaining;

const persist = () => {
  const snapshot = structuredClone(sessions());
  pendingWrite = pendingWrite.then(() => setStoreValue(KEY, snapshot)).catch(console.error);
  return pendingWrite;
};

const recordCompletion = async (session: TimerSession) => {
  const history = (await getStoreValue<{ title: string; duration: number; at: string }[]>("timer-history")) || [];
  await setStoreValue("timer-history", [
    { title: session.title, duration: session.duration, at: new Date().toLocaleString() },
    ...history,
  ].slice(0, 20));
};

export const refreshTimerSessions = () => {
  const time = Date.now();
  setNow(time);
  const finished = Object.values(sessions()).filter(session => session.running && remainingAt(session, time) === 0);
  if (!finished.length) return;
  setSessions(current => {
    const next = { ...current };
    for (const session of finished) next[session.id] = { ...session, remaining: 0, running: false, endAt: null };
    return next;
  });
  void persist();
  for (const session of finished) {
    pendingHistory = pendingHistory.then(() => recordCompletion(session)).catch(console.error);
  }
};

export const initTimerSessions = () => {
  if (!loaded) loaded = getStoreValue<Record<number, TimerSession>>(KEY).then(saved => {
    setSessions(saved || {});
    refreshTimerSessions();
    if (typeof window !== "undefined") {
      ticker = window.setInterval(refreshTimerSessions, 250);
      window.addEventListener("focus", refreshTimerSessions);
      document.addEventListener("visibilitychange", refreshTimerSessions);
    }
  }).catch(error => { loaded = undefined; throw error; });
  return loaded;
};

export const timerRemaining = (timer: TimerData | null) => {
  if (!timer) return 0;
  return remainingAt(sessions()[timer.id] || { ...timer, remaining: timer.duration, running: false, endAt: null }, now());
};
export const timerRunning = (id: number) => sessions()[id]?.running || false;

export const startTimer = (timer: TimerData) => {
  refreshTimerSessions();
  const current = sessions()[timer.id];
  const remaining = current && current.remaining > 0 ? current.remaining : timer.duration;
  setSessions(all => ({ ...all, [timer.id]: { ...timer, remaining, running: true, endAt: Date.now() + remaining * 1000 } }));
  void persist();
};

export const pauseTimer = (timer: TimerData) => {
  const current = sessions()[timer.id];
  if (!current?.running) return;
  const remaining = remainingAt(current, Date.now());
  setSessions(all => ({ ...all, [timer.id]: { ...current, remaining, running: false, endAt: null } }));
  setNow(Date.now());
  void persist();
};

export const resetTimer = (timer: TimerData) => {
  setSessions(all => ({ ...all, [timer.id]: { ...timer, remaining: timer.duration, running: false, endAt: null } }));
  setNow(Date.now());
  void persist();
};

export const removeTimerSession = (id: number) => {
  setSessions(all => { const next = { ...all }; delete next[id]; return next; });
  void persist();
};

// Used when the application shuts down in a test host; the saved deadlines remain authoritative.
export const stopTimerSessionTicker = () => {
  if (ticker !== undefined) clearInterval(ticker);
  ticker = undefined;
  if (typeof window !== "undefined") {
    window.removeEventListener("focus", refreshTimerSessions);
    document.removeEventListener("visibilitychange", refreshTimerSessions);
  }
};
