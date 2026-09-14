import { Accessor, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { getStoreValue } from "@/config/store";

/** A per-page mute state seeded from the global ticking-sound preference. */
export default function useTickingSound(tick: Accessor<number>, active: Accessor<boolean>) {
  const [muted, setMuted] = createSignal(true);
  const [ready, setReady] = createSignal(false);
  let previousTick: number | undefined;
  let context: AudioContext | undefined;

  const playTick = () => {
    try {
      context ??= new AudioContext();
      if (context.state === "suspended") void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1050, context.currentTime);
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.035);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.04);
    } catch {
      // Browsers can defer audio until the user has interacted with the page.
    }
  };

  onMount(async () => {
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

  onCleanup(() => void context?.close());
  return { muted, toggleMuted: () => setMuted((value) => !value) };
}
