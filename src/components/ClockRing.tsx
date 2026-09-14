const R = 48;
const C = 2 * Math.PI * R;

/** Depleting progress outline for a countdown face. `progress` is 1 at the start and drops to 0 as time runs out. */
export default function ClockRing(props: { progress: number }) {
  const offset = () => C * (1 - Math.max(0, Math.min(1, props.progress)));
  return (
    <svg class="clock-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="clock-ring-track" cx="50" cy="50" r={R} />
      <circle class="clock-ring-progress" cx="50" cy="50" r={R} stroke-dasharray={String(C)} stroke-dashoffset={String(offset())} />
    </svg>
  );
}
