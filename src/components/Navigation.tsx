import { A } from "@solidjs/router";
import { Clock3, House, Timer, TimerReset, Settings, CircleHelp } from "lucide-solid";

const items = [
  ["/", "Home", House], ["/timers", "Timers", Timer], ["/pomodoro", "Pomodoro", TimerReset],
  ["/settings", "Settings", Settings], ["/about", "About", CircleHelp],
] as const;

export default function Navigation(props: { collapsed?: boolean; onToggle: () => void }) {
  return <aside class="sidebar" aria-label="Sidebar" aria-expanded={!props.collapsed}><button type="button" class="brand" aria-label={props.collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!props.collapsed} title={props.collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={props.onToggle}><Clock3 size={31} /><span class="brand-label">Focus <span class="muted">Clock</span></span></button><nav class="nav" aria-label="Main navigation">
    {items.map(([href, label, Icon]) => <A href={href} end={href === "/"} activeClass="active"><Icon size={27}/><span>{label}</span></A>)}
  </nav></aside>;
}
