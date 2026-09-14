import { createSignal, onCleanup, onMount } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-solid";
import { getStoreValue, setStoreValue } from "@/config/store";
import useTickingSound from "@/hooks/useTickingSound";

type TimerData = { id: number; title: string; duration: number };
const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function TimerMain() {
  const id = Number(useParams().id);
  const [timer, setTimer] = createSignal<TimerData | null>(null);
  const [left, setLeft] = createSignal(0);
  const [running, setRunning] = createSignal(false);
  const { muted, toggleMuted } = useTickingSound(left, running);
  let end = 0;
  let tick: number | undefined;

  const complete = async () => {
    const currentTimer = timer();
    if (!currentTimer) return;
    const history = (await getStoreValue<any[]>("timer-history")) || [];
    void setStoreValue("timer-history", [{ title: currentTimer.title, duration: currentTimer.duration, at: "Just now" }, ...history].slice(0, 20));
  };
  const update = () => {
    const next = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    setLeft(next);
    if (!next) {
      setRunning(false);
      clearInterval(tick);
      void complete();
    }
  };

  onMount(async () => {
    const found = ((await getStoreValue<TimerData[]>("timers")) || []).find((item) => item.id === id);
    setTimer(found || null);
    setLeft(found?.duration || 0);
  });
  onCleanup(() => clearInterval(tick));

  const toggle = () => {
    if (running()) {
      clearInterval(tick);
      setRunning(false);
    } else if (left() > 0) {
      end = Date.now() + left() * 1000;
      tick = window.setInterval(update, 250);
      setRunning(true);
    }
  };
  const reset = () => {
    clearInterval(tick);
    setRunning(false);
    setLeft(timer()?.duration || 0);
  };
  const timeParts = () => fmt(left()).split(":");

  return <section class="page timer-main">
    <div class="clock-face">
      <div class="clock-content">
        <p class="eyebrow">Countdown</p>
        <div class="time timer-time" aria-label={fmt(left())}>
          <span>{timeParts()[0]}</span><span class="timer-separator">:</span><span>{timeParts()[1]}</span>
        </div>
        <p class="date">{timer()?.title || "Timer not found"}</p>
      </div>
      <button class="clock-sound-toggle" type="button" aria-label={muted() ? "Unmute clock ticking" : "Mute clock ticking"} aria-pressed={muted()} onClick={toggleMuted}>{muted() ? <VolumeX /> : <Volume2 />}</button>
    </div>
    <div class="timer-actions">
      <div class="pomodoro-actions">
        <button class="button primary" onClick={toggle}>{running() ? <Pause /> : <Play fill="currentColor" />}{running() ? "Pause" : "Start"}</button>
        <button class="button" onClick={reset}><RotateCcw />Reset</button>
      </div>
      <A class="muted" href="/timers">Back to timers</A>
    </div>
  </section>;
}
