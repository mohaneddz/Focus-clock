import { createSignal, onCleanup, onMount } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Maximize2, Minimize2, Minus, X } from "lucide-solid";

export default function Titlebar() {
  const windowApi = (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ? getCurrentWindow() : null;
  const [maximized, setMaximized] = createSignal(false);

  onMount(() => {
    const syncMaximized = async () => setMaximized((await windowApi?.isMaximized()) ?? false);
    void syncMaximized();

    const onKey = async (event: KeyboardEvent) => {
      if (event.key !== "F11" || !windowApi) return;
      event.preventDefault();
      // On Windows, native fullscreen covers the taskbar. F11 should instead
      // use the system work area, so the app fills the desktop without hiding it.
      await windowApi.toggleMaximize();
      setMaximized(await windowApi.isMaximized());
    };
    window.addEventListener("keydown", onKey);
    let unlistenResize: (() => void) | undefined;
    void windowApi?.onResized(() => void syncMaximized()).then((unlisten) => { unlistenResize = unlisten; });
    onCleanup(() => { window.removeEventListener("keydown", onKey); unlistenResize?.(); });
  });

  const startDragging = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest("button")) return;
    void windowApi?.startDragging();
  };
  const toggleMaximize = async () => {
    await windowApi?.toggleMaximize();
    setMaximized((await windowApi?.isMaximized()) ?? false);
  };

  return <header class="titlebar" onMouseDown={startDragging}>
    <div class="window-controls">
      <button aria-label="Minimize" class="titlebar-button" onClick={() => void windowApi?.minimize()}><Minus size={16}/></button>
      <button aria-label={maximized() ? "Restore window" : "Maximize"} class="titlebar-button" title="Maximize to the usable desktop area (F11)" onClick={() => void toggleMaximize()}>
        {maximized() ? <Minimize2 size={15}/> : <Maximize2 size={15}/>}
      </button>
      <button aria-label="Close" class="titlebar-button close" onClick={() => void windowApi?.close()}><X size={16}/></button>
    </div>
  </header>;
}
