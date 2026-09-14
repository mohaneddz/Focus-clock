import { Router, Route } from "@solidjs/router";
import { createEffect, createSignal, lazy, onCleanup, onMount, Suspense } from "solid-js";
import Titlebar from "@/components/Titlebar";
import Navigation from "@/components/Navigation";
import AmbientParticles from "@/components/AmbientParticles";
import Toaster from "@/components/Toaster";
import "@/style/App.css";
import "@/style/Home.css";
import "@/style/Controls.css";
import { focusMode, setFocusMode } from "@/config/focusMode";
import { loadSoundPrefs } from "@/config/sounds";

const Home = lazy(() => import("@/routes/Home"));
const Timers = lazy(() => import("@/routes/timer/TimerGallery"));
const Timer = lazy(() => import("@/routes/timer/TimerMain"));
const Pomodoro = lazy(() => import("@/routes/Pomodoro"));
const Settings = lazy(() => import("@/routes/Settings"));
const About = lazy(() => import("@/routes/About"));

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);

  createEffect(() => document.documentElement.classList.toggle("focus-mode", focusMode()));

  onMount(() => {
    void loadSoundPrefs();
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyS") {
        event.preventDefault();
        setSidebarCollapsed((collapsed) => !collapsed);
      }
      if (event.code === "KeyP" && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (!target?.matches("input, textarea, select, [contenteditable='true']")) {
          event.preventDefault();
          setFocusMode((active) => !active);
        }
      }
      if (event.key === "Escape" && focusMode()) {
        event.preventDefault();
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => { window.removeEventListener("keydown", onKeyDown); document.documentElement.classList.remove("focus-mode"); });
  });

  return <Router root={(props) => <div class={`app ${sidebarCollapsed() ? "sidebar-collapsed" : ""}`}>
    <img aria-hidden="true" src="/assets/focus-clock/05-sand-dust-overlay.png" style={{ position: "fixed", inset: "0", width: "100%", height: "100%", opacity: "0.035", "pointer-events": "none", "object-fit": "cover" }} />
    <AmbientParticles />
    <Navigation collapsed={sidebarCollapsed()} />
    <Titlebar />
    <main class="page-wrap"><Suspense fallback={<div class="page">Loading Focus Clock…</div>}>{props.children}</Suspense></main>
    <Toaster />
  </div>}>
    <Route path="/" component={Home} />
    <Route path="/timers" component={Timers} />
    <Route path="/timer" component={Timers} />
    <Route path="/timer/:id" component={Timer} />
    <Route path="/pomodoro" component={Pomodoro} />
    <Route path="/settings" component={Settings} />
    <Route path="/about" component={About} />
  </Router>;
}
