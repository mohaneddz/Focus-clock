import { createSignal, createEffect } from "solid-js";
import { A, useParams, useNavigate } from "@solidjs/router";
import { Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-solid";
import { getStoreValue, setStoreValue } from "@/config/store";
import useTickingSound from "@/hooks/useTickingSound";
import { selectSession } from "@/config/sessionControls";
import ClockRing from "@/components/ClockRing";

type TimerData = { id: number; title: string; duration: number };
const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

// Module-level state so a running countdown survives navigating to another
// route and back (e.g. Timer -> Settings -> Timer) instead of resetting. Only
// one timer can run at a time, so it's reset when a *different* timer id mounts.
let activeTimerId: number | null = null;
const [left, setLeft] = createSignal(0);
const [running, setRunning] = createSignal(false);
let end = 0;
let tick: number | undefined;

export default function TimerMain() {
  const params = useParams();
  const navigate = useNavigate();
  let loadVersion = 0;
  const [timer, setTimer] = createSignal<TimerData | null>(null);
  const { muted, toggleMuted } = useTickingSound(left, running);

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

  const loadTimer = async (id: number) => {
    const version = ++loadVersion;
    const found = ((await getStoreValue<TimerData[]>("timers")) || []).find((item) => item.id === id);
    if (version !== loadVersion) return;
    setTimer(found || null);
    if (activeTimerId !== id) {
      activeTimerId = id;
      clearInterval(tick);
      setRunning(false);
      setLeft(found?.duration || 0);
    }
    if (found) selectSession("timer", { "play-pause": toggle, stop: reset, reset, next: () => adjacent(1), previous: () => adjacent(-1), pause });
  };
  createEffect(() => { void loadTimer(Number(params.id)); });

  const adjacent = async (direction: number) => {
    const timers = (await getStoreValue<TimerData[]>("timers")) || [];
    if (!timers.length) return;
    const index = timers.findIndex(item => item.id === activeTimerId);
    const next = timers[(index + direction + timers.length) % timers.length];
    const resume = running();
    pause();
    await loadTimer(next.id);
    if (resume) toggle();
    // Selecting a different preset should also show which timer is now controlled.
    navigate(`/timer/${next.id}`);
  };
  const pause = () => {
    if (running()) update();
    clearInterval(tick);
    setRunning(false);
  };
  const toggle = () => {
    if (running()) {
      pause();
    } else if (timer()) {
      if (left() <= 0) setLeft(timer()!.duration);
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
      <ClockRing progress={(timer()?.duration || 0) ? left() / (timer()!.duration) : 0} />
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
        <button class="button" onClick={reset}><Square />Stop</button>
        <button class="button" onClick={reset}><RotateCcw />Reset</button>
      </div>
      <A class="muted" href="/timers">Back to timers</A>
    </div>
  </section>;
}
