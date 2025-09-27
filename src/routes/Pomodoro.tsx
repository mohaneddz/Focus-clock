import { createSignal, createEffect, Suspense } from "solid-js";

import { lazy } from "solid-js";

const PomodoroSettings = lazy(() => import("@/routes/pomodoro/PomodoroSettings"));
const PomodoroMain = lazy(() => import("@/routes/pomodoro/PomodoroMain"));

import usePomodoro from "@/hooks/usePomodoro";

export default function Pomodoro() {

  const { getSettings, pomodoroTime, shortBreakTime, longBreakTime, audioEnabled, numberOfRounds } = usePomodoro();

  const [page, setPage] = createSignal<'main' | 'settings'>('main');

  // Create a reactive settings object that updates with the hook state
  const settings = (): PomodoroSettings => ({
    pomodoroTimeSeconds: pomodoroTime(),
    shortBreakTimeSeconds: shortBreakTime(),
    longBreakTimeSeconds: longBreakTime(),
    audioEnabled: audioEnabled(),
    numberOfRounds: numberOfRounds(),
  });

  createEffect(() => {
    // Load settings when component mounts
    getSettings();
  });

  return (
    <>
      {page() === 'main' ? (
        <Suspense fallback={<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>}>
          <PomodoroMain setPage={setPage} settings={settings} />
        </Suspense>
      ) : (
        <Suspense fallback={<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>}>
          <PomodoroSettings setPage={setPage} settings={settings} />
        </Suspense>
      )}
    </>
  );
};
