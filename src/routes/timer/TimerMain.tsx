import { createSignal, createEffect } from "solid-js";
import { A, useParams, useNavigate } from "@solidjs/router";
import { Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-solid";
import { getStoreValue } from "@/config/store";
import useTickingSound from "@/hooks/useTickingSound";
import { selectSession } from "@/config/sessionControls";
import { initTimerSessions, pauseTimer, resetTimer, startTimer, timerRemaining, timerRunning, type TimerData } from "@/config/timerSessions";
import ClockRing from "@/components/ClockRing";

const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function TimerMain() {
  const params = useParams();
  const navigate = useNavigate();
  let loadVersion = 0;
  const [timer, setTimer] = createSignal<TimerData | null>(null);
  const left = () => timerRemaining(timer());
  const running = () => timerRunning(timer()?.id ?? -1);
  const { muted, toggleMuted } = useTickingSound(left, running);

  const pause = () => { const current = timer(); if (current) pauseTimer(current); };
  const reset = () => { const current = timer(); if (current) resetTimer(current); };
  const toggle = () => {
    const current = timer();
    if (!current) return;
    if (running()) pauseTimer(current); else startTimer(current);
  };

  const loadTimer = async (id: number) => {
    const version = ++loadVersion;
    const [timers] = await Promise.all([getStoreValue<TimerData[]>("timers"), initTimerSessions()]);
    if (version !== loadVersion) return;
    const found = (timers || []).find(item => item.id === id) || null;
    setTimer(found);
    if (found) selectSession("timer", { "play-pause": toggle, stop: reset, reset, next: () => adjacent(1), previous: () => adjacent(-1), pause });
  };
  createEffect(() => { void loadTimer(Number(params.id)); });

  const adjacent = async (direction: number) => {
    const timers = (await getStoreValue<TimerData[]>("timers")) || [];
    if (!timers.length) return;
    const index = timers.findIndex(item => item.id === timer()?.id);
    const next = timers[(index + direction + timers.length) % timers.length];
    const startNext = running();
    // Each saved timer owns its deadline. Selecting another leaves this one running.
    await loadTimer(next.id);
    if (startNext && !timerRunning(next.id)) startTimer(next);
    // Selecting a different preset should also show which timer is now controlled.
    navigate(`/timer/${next.id}`);
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
