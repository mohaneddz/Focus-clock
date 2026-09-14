import { createSignal, onMount } from "solid-js";
import { disable, enable } from "@tauri-apps/plugin-autostart";
import { getStoreValue, setStoreValue } from "@/config/store";

type Config = { pomodoroTimeSeconds: number; shortBreakTimeSeconds: number; longBreakTimeSeconds: number; numberOfRounds: number };
const defaults: Config = { pomodoroTimeSeconds: 1500, shortBreakTimeSeconds: 300, longBreakTimeSeconds: 900, numberOfRounds: 4 };
const Toggle = (props: { on: boolean; set: (value: boolean) => void | Promise<void> }) => <button role="switch" aria-checked={props.on} class={`switch ${props.on ? "on" : ""}`} onClick={() => void props.set(!props.on)}><i /></button>;
const Step = (props: { value: number; set: (value: number) => void; min?: number; unit?: string }) => <div class="stepper"><button onClick={() => props.set(Math.max(props.min || 1, props.value - 1))}>−</button><span>{props.value}{props.unit}</span><button onClick={() => props.set(props.value + 1)}>＋</button></div>;

export default function Settings() {
  const [close, setClose] = createSignal(false);
  const [minimized, setMinimized] = createSignal(false);
  const [particles, setParticles] = createSignal(true);
  const [notify, setNotify] = createSignal(true);
  const [remind, setRemind] = createSignal(true);
  const [ticking, setTicking] = createSignal(true);
  const [volume, setVolume] = createSignal(70);
  const [config, setConfig] = createSignal(defaults);

  onMount(async () => {
    setClose((await getStoreValue<boolean>("closeToTray")) ?? false);
    setMinimized((await getStoreValue<boolean>("startMinimized")) ?? false);
    setParticles((await getStoreValue<boolean>("ambientParticles")) ?? true);
    setNotify((await getStoreValue<boolean>("notifications")) ?? true);
    setRemind((await getStoreValue<boolean>("reminders")) ?? true);
    setTicking((await getStoreValue<boolean>("tickingSound")) ?? true);
    setVolume((await getStoreValue<number>("soundVolume")) ?? 70);
    setConfig((await getStoreValue<Config>("pomodoro-settings")) || defaults);
  });

  const save = async () => {
    await Promise.all([
      setStoreValue("closeToTray", close()), setStoreValue("startMinimized", minimized()),
      setStoreValue("ambientParticles", particles()), setStoreValue("notifications", notify()),
      setStoreValue("reminders", remind()), setStoreValue("tickingSound", ticking()),
      setStoreValue("soundVolume", volume()), setStoreValue("pomodoro-settings", config()),
    ]);
  };

  return <section class="page">
    <div class="toolbar"><div><h1>Settings</h1><p class="subtitle">Make Focus Clock work your way</p></div></div>
    <div class="settings-grid">
      <section class="panel"><h2>General</h2>
        <div class="setting"><div class="copy"><strong>Launch at startup</strong><small>Start Focus Clock when Windows starts</small></div><Toggle on={false} set={(value) => value ? enable() : disable()} /></div>
        <div class="setting"><div class="copy"><strong>Minimize to tray</strong><small>Keep running in the background</small></div><Toggle on={close()} set={setClose} /></div>
        <div class="setting"><div class="copy"><strong>Start minimized</strong><small>Launch directly to system tray</small></div><Toggle on={minimized()} set={setMinimized} /></div>
      </section>
      <section class="panel"><h2>Appearance</h2>
        <div class="setting"><div class="copy"><strong>Ambient texture</strong><small>Show restrained visual texture</small></div><Toggle on={particles()} set={setParticles} /></div>
        <div class="setting"><div class="copy"><strong>Background intensity</strong><small>Adjust background visibility</small></div><input class="slider" type="range" /></div>
      </section>
      <section class="panel"><h2>Notifications & sound</h2>
        <div class="setting"><div class="copy"><strong>Timer complete</strong><small>Show a notification when a timer ends</small></div><Toggle on={notify()} set={setNotify} /></div>
        <div class="setting"><div class="copy"><strong>Session reminders</strong><small>Gentle reminders to keep you on track</small></div><Toggle on={remind()} set={setRemind} /></div>
        <div class="setting"><div class="copy"><strong>Ticking sound</strong><small>Use this as the default for every clock</small></div><Toggle on={ticking()} set={setTicking} /></div>
        <div class="setting"><div class="copy"><strong>Sound volume</strong><small>Adjust notification volume</small></div><input class="slider" type="range" value={volume()} onInput={(event) => setVolume(Number(event.currentTarget.value))} /></div>
      </section>
      <section class="panel"><h2>Timer defaults</h2>
        <div class="setting"><div class="copy"><strong>Focus</strong><small>Default focus session length</small></div><Step value={config().pomodoroTimeSeconds / 60} unit=" min" set={(value) => setConfig({ ...config(), pomodoroTimeSeconds: value * 60 })} /></div>
        <div class="setting"><div class="copy"><strong>Short break</strong><small>Default short break length</small></div><Step value={config().shortBreakTimeSeconds / 60} unit=" min" set={(value) => setConfig({ ...config(), shortBreakTimeSeconds: value * 60 })} /></div>
        <div class="setting"><div class="copy"><strong>Long break</strong><small>Default long break length</small></div><Step value={config().longBreakTimeSeconds / 60} unit=" min" set={(value) => setConfig({ ...config(), longBreakTimeSeconds: value * 60 })} /></div>
        <div class="setting"><div class="copy"><strong>Sessions</strong><small>Default number of sessions</small></div><Step value={config().numberOfRounds} set={(value) => setConfig({ ...config(), numberOfRounds: value })} /></div>
      </section>
    </div>
    <div class="settings-footer"><button class="button" onClick={() => setConfig(defaults)}>Reset defaults</button><button class="button primary" onClick={() => void save()}>Save changes</button></div>
  </section>;
}
