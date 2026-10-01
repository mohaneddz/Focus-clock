import { listen } from "@tauri-apps/api/event";

export type SessionAction = "play-pause" | "stop" | "reset" | "next" | "previous";
export type SessionControls = Record<SessionAction, () => void | Promise<void>> & { pause: () => void };
let current: { kind: "timer" | "pomodoro"; controls: SessionControls } | undefined;
let pending = Promise.resolve();

// Keep the last used session available even after its route unmounts.
export function selectSession(kind: "timer" | "pomodoro", controls: SessionControls) {
  if (current && current.kind !== kind) current.controls.pause();
  current = { kind, controls };
}

export function dispatchSessionAction(action: SessionAction) {
  // Navigation/storage are async; preserve the order of rapid shortcut presses.
  const result = pending.then(() => current?.controls[action]?.());
  pending = result.catch(() => {});
  return result;
}

export function listenForSessionShortcuts() {
  return listen<SessionAction>("session-shortcut", ({ payload }) => {
    void dispatchSessionAction(payload).catch(console.error);
  });
}
