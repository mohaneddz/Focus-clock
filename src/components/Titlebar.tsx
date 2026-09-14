import { onCleanup, onMount } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-solid";

export default function Titlebar() {
  const windowApi = getCurrentWindow();
  onMount(() => { const onKey = (e: KeyboardEvent) => { if (e.key === "F11") { e.preventDefault(); windowApi.setFullscreen(true); } }; window.addEventListener("keydown", onKey); onCleanup(() => window.removeEventListener("keydown", onKey)); });
  return <header data-tauri-drag-region class="titlebar"><button aria-label="Minimize" class="titlebar-button" onClick={() => windowApi.minimize()}><Minus size={17}/></button><button aria-label="Maximize" class="titlebar-button" onClick={() => windowApi.toggleMaximize()}><Square size={14}/></button><button aria-label="Close" class="titlebar-button close" onClick={() => windowApi.close()}><X size={17}/></button></header>;
}
