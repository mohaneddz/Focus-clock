import { createSignal, onCleanup, onMount } from "solid-js";
import { getCurrentWindow, currentMonitor, LogicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { Maximize2, Minimize2, Minus, X } from "lucide-solid";
import { toast } from "@/config/toast";

export default function Titlebar() {
  const windowApi = (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ? getCurrentWindow() : null;
  const [maximized, setMaximized] = createSignal(false);
  const [isFullscreen, setIsFullscreen] = createSignal(false);

  onMount(() => {
    let disposed = false;
    let changingFullscreen = false;
    let savedState: { x: number; y: number; width: number; height: number; wasMaximized: boolean } | null = null;

    const syncMaximized = async () => setMaximized((await windowApi?.isMaximized()) ?? false);
    void syncMaximized();

    const onKey = async (event: KeyboardEvent) => {
      if (event.key !== "F11" || !windowApi) return;
      event.preventDefault();
      if (event.repeat || changingFullscreen) return;
      changingFullscreen = true;
      try {
        if (isFullscreen()) {
          // Exit fullscreen: restore saved position/size or unmaximize
          if (savedState) {
            if (savedState.wasMaximized) {
              await windowApi.toggleMaximize();
            } else {
              await windowApi.setPosition(new LogicalPosition(savedState.x, savedState.y));
              await windowApi.setSize(new LogicalSize(savedState.width, savedState.height));
            }
            savedState = null;
          }
          setIsFullscreen(false);
          document.documentElement.classList.remove("native-fullscreen");
        } else {
          // Enter fullscreen: save current state and resize to monitor bounds
          const wasMaximized = await windowApi.isMaximized();
          if (wasMaximized) {
            await windowApi.toggleMaximize();
          }
          const pos = await windowApi.outerPosition();
          const size = await windowApi.outerSize();
          savedState = { x: pos.x, y: pos.y, width: size.width, height: size.height, wasMaximized };

          const monitor = await currentMonitor();
          if (monitor) {
            await windowApi.setPosition(new LogicalPosition(monitor.position.x, monitor.position.y));
            await windowApi.setSize(new LogicalSize(monitor.size.width, monitor.size.height));
          }
          setIsFullscreen(true);
          document.documentElement.classList.add("native-fullscreen");
        }
      } catch (error) {
        console.error(error);
        toast("Could not change fullscreen", "error");
      } finally { changingFullscreen = false; }
    };
    window.addEventListener("keydown", onKey);
    let unlistenResize: (() => void) | undefined;
    void windowApi?.onResized(() => {
      void syncMaximized();
    }).then((unlisten) => { if (disposed) unlisten(); else unlistenResize = unlisten; });
    onCleanup(() => { disposed = true; window.removeEventListener("keydown", onKey); unlistenResize?.(); document.documentElement.classList.remove("native-fullscreen"); setIsFullscreen(false); });
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
      <button aria-label={maximized() ? "Restore window" : "Maximize"} class="titlebar-button" title="Maximize window (F11 toggles fullscreen)" onClick={() => void toggleMaximize()}>
        {maximized() ? <Minimize2 size={15}/> : <Maximize2 size={15}/>}
      </button>
      <button aria-label="Close" class="titlebar-button close" onClick={() => void windowApi?.close()}><X size={16}/></button>
    </div>
  </header>;
}
