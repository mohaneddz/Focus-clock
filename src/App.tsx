import { createSignal, Show } from "solid-js";
// import { invoke } from "@tauri-apps/api/core";

import Titlebar from "@/components/Titlebar";

import Menu from 'lucide-solid/icons/menu';
import Navigation from "@/components/Navigation";

import { Router } from "@solidjs/router";
import { lazy } from "solid-js";

const routes = [
  {
    path: "/",
    component: lazy(() => import("@/routes/Home.tsx")),
  },
  {
    path: "/about",
    component: lazy(() => import("@/routes/About.tsx")),
  },
  {
    path: "/pomodoro",
    component: lazy(() => import("@/routes/Pomodoro")),
  },
  {
    path: "/timer",
    component: lazy(() => import("@/routes/timer/TimerGallery")),
  },
  {
    path: "/timer/:id",
    component: lazy(() => import("@/routes/timer/TimerMain")),
  }
]

import "@/style/App.css";
import "@/style/Theme.css";
import "@/style/Components.css";

function App() {

  const [menuOpen, setMenuOpen] = createSignal(false);

  return (
    <div class="h-screen w-screen flex flex-col">

      <Titlebar />

      <Menu class="w-8 h-8 fixed top-4 left-4 opacity-50 hover:opacity-100 click z-50" onClick={() => setMenuOpen(!menuOpen())} />

      <Show when={menuOpen()}>
        <Navigation onClick={() => setMenuOpen(false)} />
      </Show>

      <main class="full center col">
        <Router>{routes}</Router>
      </main>
    </div>
  );
}

export default App;
