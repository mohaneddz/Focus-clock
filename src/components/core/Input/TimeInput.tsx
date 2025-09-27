import { createSignal, createEffect } from "solid-js";

interface TimeInputProps {
  id?: string;
  class?: string;
  value?: number; // value in seconds
  onChange?: (value: number) => void; // emit value in seconds
}

function pad(num: number) {
  return num.toString().padStart(2, "0");
}

// Convert seconds to [h, m, s]
function secondsToHMS(totalSeconds: number): [number, number, number] {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s];
}

// Convert [h, m, s] to seconds
function hmsToSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s;
}

export default function TimeInput(props: TimeInputProps) {
  // Parse initial value or default to 0
  const initial = secondsToHMS(props.value ?? 0);

  const [hours, setHours] = createSignal(initial[0]);
  const [minutes, setMinutes] = createSignal(initial[1]);
  const [seconds, setSeconds] = createSignal(initial[2]);

  // Sync with props.value
  createEffect(() => {
    if (typeof props.value === "number") {
      const [h, m, s] = secondsToHMS(props.value);
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }
  });

  // Notify parent on change (in seconds)
  const emitChange = (h: number, m: number, s: number) => {
    const total = hmsToSeconds(h, m, s);
    props.onChange?.(total);
  };

  const handleHours = (e: Event) => {
    let v = Math.max(0, Math.min(23, Number((e.currentTarget as HTMLInputElement).value)));
    setHours(v);
    emitChange(v, minutes(), seconds());
  };
  const handleMinutes = (e: Event) => {
    let v = Math.max(0, Math.min(59, Number((e.currentTarget as HTMLInputElement).value)));
    setMinutes(v);
    emitChange(hours(), v, seconds());
  };
  const handleSeconds = (e: Event) => {
    let v = Math.max(0, Math.min(59, Number((e.currentTarget as HTMLInputElement).value)));
    setSeconds(v);
    emitChange(hours(), minutes(), v);
  };

  return (
    <div class={`${props.class} bg-[#445f6b] center`} >
      <input
        id={props.id ? `${props.id}-h` : undefined}
        type="number"
        min="0"
        max="23"
        value={pad(hours())}
        onInput={handleHours}
        style={{ width: "2.5em" }}
      />
      <span>:</span>
      <input
        id={props.id ? `${props.id}-m` : undefined}
        type="number"
        min="0"
        max="59"
        value={pad(minutes())}
        onInput={handleMinutes}
        style={{ width: "2.5em" }}
      />
      <span>:</span>
      <input
        id={props.id ? `${props.id}-s` : undefined}
        type="number"
        min="0"
        max="59"
        value={pad(seconds())}
        onInput={handleSeconds}
        style={{ width: "2.5em" }}
      />
    </div>
  );
}
