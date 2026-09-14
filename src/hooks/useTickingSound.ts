import { Accessor, createEffect, createSignal, onMount } from "solid-js";
import { getStoreValue } from "@/config/store";
import { loadSoundPrefs, playTick } from "@/config/sounds";

/** A per-page mute state seeded from the global ticking-sound preference. */
export default function useTickingSound(tick: Accessor<number>, active: Accessor<boolean>) {
  const [muted, setMuted] = createSignal(true);
  const [ready, setReady] = createSignal(false);
  let previousTick: number | undefined;

  onMount(async () => {
    await loadSoundPrefs();
    setMuted(!((await getStoreValue<boolean>("tickingSound")) ?? true));
    setReady(true);
  });

  createEffect(() => {
    const currentTick = tick();
    if (!ready() || !active()) {
      previousTick = currentTick;
      return;
    }
    if (previousTick !== undefined && currentTick !== previousTick && !muted()) playTick();
    previousTick = currentTick;
  });

  return { muted, toggleMuted: () => setMuted((value) => !value) };
}
