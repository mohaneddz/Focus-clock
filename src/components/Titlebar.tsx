import { createSignal, onCleanup, onMount } from "solid-js";
import { currentMonitor, getCurrentWindow, PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { Maximize2, Minimize2, Minus, X } from "lucide-solid";
import { toast } from "@/config/toast";

export default function Titlebar(props: { mobileMenuOpen?: boolean; onMenuToggle?: () => void }) {
  const windowApi = (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ? getCurrentWindow() : null;
  const [maximized, setMaximized] = createSignal(false);
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  // The window is borderless (decorations: false), where tao's native fullscreen
  // is unreliable on Windows. Instead we do borderless fullscreen manually:
  // cover the whole monitor and sit always-on-top so the taskbar is hidden too.
  let saved: { position: PhysicalPosition; size: PhysicalSize; wasMaximized: boolean } | null = null;

  const syncMaximized = async () => { if (windowApi && !isFullscreen()) setMaximized(await windowApi.isMaximized()); };

  const enterFullscreen = async () => {
    if (!windowApi) return;
    const monitor = await currentMonitor();
    if (!monitor) throw new Error("No monitor information available");
    saved = { position: await windowApi.outerPosition(), size: await windowApi.outerSize(), wasMaximized: await windowApi.isMaximized() };
    await windowApi.setAlwaysOnTop(true);
    await windowApi.setPosition(new PhysicalPosition(monitor.position.x, monitor.position.y));
    await windowApi.setSize(new PhysicalSize(monitor.size.width, monitor.size.height));
    setIsFullscreen(true);
    document.documentElement.classList.add("native-fullscreen");
  };

  const exitFullscreen = async () => {
    if (!windowApi) return;
    await windowApi.setAlwaysOnTop(false);
    if (saved?.wasMaximized) {
      await windowApi.setPosition(saved.position);
      await windowApi.maximize();
    } else if (saved) {
      await windowApi.setPosition(saved.position);
      await windowApi.setSize(saved.size);
    }
    saved = null;
    setIsFullscreen(false);
    document.documentElement.classList.remove("native-fullscreen");
    await syncMaximized();
  };

  onMount(() => {
    let disposed = false;
    let changingFullscreen = false;
    void syncMaximized();

    const onKey = async (event: KeyboardEvent) => {
      if (event.key !== "F11" || !windowApi) return;
      event.preventDefault();
      if (event.repeat || changingFullscreen) return;
      changingFullscreen = true;
      try {
        if (isFullscreen()) await exitFullscreen(); else await enterFullscreen();
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
    await syncMaximized();
  };

  return <header class="titlebar" onMouseDown={startDragging}>
    <button type="button" class={`mobile-menu-toggle ${props.mobileMenuOpen ? "is-open" : ""}`} aria-label={props.mobileMenuOpen ? "Close menu" : "Open menu"} aria-controls="main-navigation" aria-expanded={!!props.mobileMenuOpen} onClick={props.onMenuToggle}>
      <span class="menu-icon" aria-hidden="true"><span /><span /><span /></span>
    </button>
    <div class="window-controls">
      <button aria-label="Minimize" class="titlebar-button" onClick={() => void windowApi?.minimize()}><Minus size={16}/></button>
      <button aria-label={maximized() ? "Restore window" : "Maximize"} class="titlebar-button" title="Maximize window (F11 toggles fullscreen)" onClick={() => void toggleMaximize()}>
        {maximized() ? <Minimize2 size={15}/> : <Maximize2 size={15}/>}
      </button>
      <button aria-label="Close" class="titlebar-button close" onClick={() => void windowApi?.close()}><X size={16}/></button>
    </div>
  </header>;
}
