import { CircleHelp, Clock3, Github, RefreshCw, Timer, TimerReset } from "lucide-solid";

const shortcuts = [
  ["P", "Toggle focus mode"],
  ["Ctrl", "+", "S", "Collapse or expand sidebar"],
  ["F11", "Toggle fullscreen"],
  ["Esc", "Exit focus mode"],
] as const;

export default function About() {
  return <section class="page about">
    <div class="about-mark"><Clock3 size={155} stroke-width={1.4} /></div>
    <div class="about-copy">
      <p class="eyebrow">Focus Clock</p>
      <h1>Time, made intentional.</h1>
      <p class="subtitle">A calm desktop companion for clocks, countdowns, and focused work.</p>
      <div class="feature-row">
        <div class="feature"><Clock3 size={42} /><p>Live clock</p></div>
        <div class="feature"><Timer size={42} /><p>Custom timers</p></div>
        <div class="feature"><TimerReset size={42} /><p>Pomodoro</p></div>
      </div>
      <div class="panel about-version">
        <div><strong>Version 1.0.0</strong><small class="muted">Built with Tauri + SolidJS</small></div>
        <a class="button" href="https://github.com" target="_blank" rel="noreferrer"><Github size={18} /> View source</a>
        <button class="button" type="button"><RefreshCw size={18} /> Check for updates</button>
      </div>
      <section class="panel about-shortcuts" aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title"><CircleHelp size={21} /> Shortcuts</h2>
        <div class="shortcut-list">
          {shortcuts.map((shortcut) => <div class="shortcut-row">
            <span class="shortcut-keys">{shortcut.slice(0, -1).map((key) => key === "+" ? <span class="key-join">+</span> : <kbd>{key}</kbd>)}</span>
            <span>{shortcut[shortcut.length - 1]}</span>
          </div>)}
        </div>
      </section>
      <p class="muted about-footer">Privacy　 |　 Licenses　 |　 Report an issue<br /><br />Designed for deep focus.</p>
    </div>
  </section>;
}
