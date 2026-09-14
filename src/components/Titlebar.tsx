import { onCleanup, onMount } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-solid";

export default function Titlebar() {
  const windowApi = (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ? getCurrentWindow() : null;
  onMount(() => { const onKey = (e: KeyboardEvent) => { if (e.key === "F11" && windowApi) { e.preventDefault(); void windowApi.setFullscreen(true); } }; window.addEventListener("keydown", onKey); onCleanup(() => window.removeEventListener("keydown", onKey)); });
  return <header data-tauri-drag-region class="titlebar"><div class="window-controls"><button aria-label="Minimize" class="titlebar-button" onClick={() => void windowApi?.minimize()}><Minus size={16}/></button><button aria-label="Maximize" class="titlebar-button" onClick={() => void windowApi?.toggleMaximize()}><Square size={13}/></button><button aria-label="Close" class="titlebar-button close" onClick={() => void windowApi?.close()}><X size={16}/></button></div></header>;
}
