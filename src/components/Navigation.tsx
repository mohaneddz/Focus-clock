import { A } from "@solidjs/router";
import { Clock3, House, Timer, TimerReset, Settings, CircleHelp } from "lucide-solid";

const items = [
  ["/", "Home", House], ["/timers", "Timers", Timer], ["/pomodoro", "Pomodoro", TimerReset],
  ["/settings", "Settings", Settings], ["/about", "About", CircleHelp],
] as const;

export default function Navigation() {
  return <aside class="sidebar"><div class="brand" data-tauri-drag-region><Clock3 size={31} /><span>Focus <span class="muted">Clock</span></span></div><nav class="nav" aria-label="Main navigation">
    {items.map(([href, label, Icon]) => <A href={href} end={href === "/"} activeClass="active"><Icon size={27}/><span>{label}</span></A>)}
  </nav></aside>;
}
