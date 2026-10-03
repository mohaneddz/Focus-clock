import { createSignal, For } from "solid-js";
import { CircleHelp, Clock3, Github, Timer, TimerReset } from "lucide-solid";
import Modal from "@/components/Modal";

const shortcuts = [
  { keys: ["P"], label: "Toggle focus mode" },
  { keys: ["Ctrl", "+", "S"], label: "Collapse or expand sidebar" },
  { keys: ["F11"], label: "Maximize or restore window" },
  { keys: ["Esc"], label: "Exit focus mode" },
  { keys: ["Right Alt", "+", "P"], label: "Play or pause the current timer or Pomodoro" },
  { keys: ["Right Alt", "+", "O"], label: "Stop the current timer or Pomodoro" },
  { keys: ["Right Alt", "+", "L"], label: "Reset the countdown or Pomodoro cycle" },
  { keys: ["Right Alt", "+", "> / <"], label: "Change Pomodoro phase or saved timer" },
] as const;

export default function About() {
  const [shortcutsOpen, setShortcutsOpen] = createSignal(false);

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
        <div><strong>Version 2.1.1</strong><small class="muted">Built with Tauri + SolidJS</small></div>
        <a class="button" href="https://github.com" target="_blank" rel="noreferrer"><Github size={18} /> View source</a>
        <button class="button" type="button" onClick={() => setShortcutsOpen(true)}><CircleHelp size={18} /> Keyboard shortcuts</button>
      </div>
      <p class="muted about-footer">Privacy　 |　 Licenses　 |　 Report an issue<br /><br />Designed for deep focus.</p>
    </div>
    <Modal show={shortcutsOpen()} onClose={() => setShortcutsOpen(false)}>
      <section class="about-shortcuts shortcut-modal" aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title"><CircleHelp size={21} /> Keyboard shortcuts</h2>
        <div class="shortcut-list">
          <For each={shortcuts}>{shortcut => <div class="shortcut-row">
            <span class="shortcut-keys">{shortcut.keys.map((key) => key === "+" ? <span class="key-join">+</span> : <kbd>{key}</kbd>)}</span>
            <span>{shortcut.label}</span>
          </div>}</For>
        </div>
      </section>
    </Modal>
  </section>;
}
