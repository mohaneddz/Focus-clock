import { getStoreValue } from "@/config/store";

export type TickVariant = "soft" | "wood" | "click" | "pulse";
export const tickVariants: { id: TickVariant; label: string }[] = [
  { id: "soft", label: "Soft" },
  { id: "wood", label: "Wood" },
  { id: "click", label: "Click" },
  { id: "pulse", label: "Pulse" },
];

export type ChimeName = "breakDone" | "focusDone" | "longBreakDone" | "sessionsComplete";
type Note = { freq: number; at: number; dur: number; gain: number };
const chimes: Record<ChimeName, Note[]> = {
  breakDone: [{ freq: 659.25, at: 0, dur: 0.55, gain: 0.8 }, { freq: 987.77, at: 0.11, dur: 0.7, gain: 0.9 }],
  focusDone: [{ freq: 880, at: 0, dur: 0.5, gain: 0.7 }, { freq: 659.25, at: 0.13, dur: 0.55, gain: 0.7 }, { freq: 523.25, at: 0.27, dur: 0.95, gain: 0.9 }],
  longBreakDone: [{ freq: 392, at: 0, dur: 0.6, gain: 0.8 }, { freq: 587.33, at: 0.14, dur: 0.85, gain: 0.85 }],
  sessionsComplete: [
    { freq: 523.25, at: 0, dur: 0.45, gain: 0.7 }, { freq: 659.25, at: 0.1, dur: 0.45, gain: 0.7 },
    { freq: 783.99, at: 0.2, dur: 0.45, gain: 0.75 }, { freq: 1046.5, at: 0.31, dur: 1.15, gain: 1 },
    { freq: 1567.98, at: 0.43, dur: 0.95, gain: 0.5 },
  ],
};

let context: AudioContext | undefined;
let volume = 0.7;
let variant: TickVariant = "soft";

const audio = () => {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  context ??= new Ctx();
  if (context.state === "suspended") void context.resume();
  return context;
};

export const loadSoundPrefs = async () => {
  volume = ((await getStoreValue<number>("soundVolume")) ?? 70) / 100;
  variant = (await getStoreValue<TickVariant>("tickSound")) ?? "soft";
};
export const setSoundVolume = (percent: number) => { volume = Math.max(0, Math.min(100, percent)) / 100; };
export const setTickVariant = (next: TickVariant) => { variant = next; };

export const playTick = (override?: TickVariant, scale = 1) => {
  if (volume <= 0) return;
  try {
    const ctx = audio();
    const now = ctx.currentTime;
    const level = volume * scale;
    const kind = override ?? variant;
    if (kind === "click") {
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 2200;
      const gain = ctx.createGain();
      gain.gain.value = 0.35 * level;
      source.connect(highpass).connect(gain).connect(ctx.destination);
      source.start();
      return;
    }
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    if (kind === "wood") {
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(900, now);
      oscillator.frequency.exponentialRampToValueAtTime(480, now + 0.05);
      gain.gain.setValueAtTime(0.06 * level, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      oscillator.stop(now + 0.07);
    } else if (kind === "pulse") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.07 * level, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      oscillator.stop(now + 0.1);
    } else {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1050, now);
      gain.gain.setValueAtTime(0.035 * level, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      oscillator.stop(now + 0.04);
    }
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
  } catch {
    // Browsers can defer audio until the user has interacted with the page.
  }
};

/** Audibly preview a tick timbre: a few boosted ticks so the sound registers. */
export const previewTick = (variant: TickVariant) => {
  [0, 200, 400].forEach((delay) => setTimeout(() => playTick(variant, 2.6), delay));
};

export const playChime = (name: ChimeName) => {
  if (volume <= 0) return;
  try {
    const ctx = audio();
    for (const note of chimes[name]) {
      const start = ctx.currentTime + note.at;
      const fundamental = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      const shimmerGain = ctx.createGain();
      fundamental.type = "sine";
      shimmer.type = "sine";
      fundamental.frequency.value = note.freq;
      shimmer.frequency.value = note.freq * 2.01;
      shimmerGain.gain.value = 0.3;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(note.gain * 0.26 * volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);
      fundamental.connect(gain);
      shimmer.connect(shimmerGain).connect(gain);
      gain.connect(ctx.destination);
      fundamental.start(start);
      shimmer.start(start);
      fundamental.stop(start + note.dur);
      shimmer.stop(start + note.dur);
    }
  } catch {
    // Audio may be unavailable until the user interacts with the page.
  }
};
