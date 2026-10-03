import { A } from "@solidjs/router";
import { Clock3, House, Timer, TimerReset, Settings, CircleHelp } from "lucide-solid";

const items = [
  ["/", "Home", House], ["/timers", "Timers", Timer], ["/pomodoro", "Pomodoro", TimerReset],
  ["/settings", "Settings", Settings], ["/about", "About", CircleHelp],
] as const;

export default function Navigation(props: { collapsed?: boolean; mobileOpen: boolean; onToggle: () => void; onClose: () => void }) {
  const toggle = (event: MouseEvent) => { event.preventDefault(); props.onToggle(); };
  return <>
    <button type="button" class={`mobile-menu-backdrop ${props.mobileOpen ? "is-open" : ""}`} aria-label="Close menu" tabIndex={props.mobileOpen ? 0 : -1} onClick={props.onClose} />
    <aside class={`sidebar ${props.mobileOpen ? "mobile-open" : ""}`} aria-label="Sidebar">
      <button type="button" class="brand" aria-label={props.mobileOpen ? "Close menu" : props.collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={props.mobileOpen || !props.collapsed} title={props.mobileOpen ? "Close menu" : props.collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={toggle}><Clock3 size={31} /><span class="brand-label">Focus <span class="muted">Clock</span></span></button>
      <nav id="main-navigation" class="nav" aria-label="Main navigation">
        {items.map(([href, label, Icon]) => <A href={href} end={href === "/"} activeClass="active" onClick={props.onClose}><Icon size={27}/><span>{label}</span></A>)}
      </nav>
    </aside>
  </>;
}
