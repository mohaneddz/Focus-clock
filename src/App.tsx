import { Router, Route } from "@solidjs/router";
import { lazy, Suspense } from "solid-js";
import Titlebar from "@/components/Titlebar";
import Navigation from "@/components/Navigation";
import "@/style/App.css";

const Home = lazy(() => import("@/routes/Home"));
const Timers = lazy(() => import("@/routes/timer/TimerGallery"));
const Timer = lazy(() => import("@/routes/timer/TimerMain"));
const Pomodoro = lazy(() => import("@/routes/Pomodoro"));
const Settings = lazy(() => import("@/routes/Settings"));
const About = lazy(() => import("@/routes/About"));

export default function App() {
  return <Router root={(props) => <div class="app"><Navigation /><Titlebar /><main class="page-wrap"><Suspense fallback={<div class="page">Loading Focus Clock…</div>}>{props.children}</Suspense></main></div>}>
    <Route path="/" component={Home} />
    <Route path="/timers" component={Timers} />
    <Route path="/timer" component={Timers} />
    <Route path="/timer/:id" component={Timer} />
    <Route path="/pomodoro" component={Pomodoro} />
    <Route path="/settings" component={Settings} />
    <Route path="/about" component={About} />
  </Router>;
}
