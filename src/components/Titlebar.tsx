import { createSignal, onMount, Show } from 'solid-js';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

export default function Titlebar() {
  const appWindow = getCurrentWindow();

  const [isFullscreen, setIsFullscreen] = createSignal(false);
  const [isMaximized, setIsMaximized] = createSignal(false);

  const toggleFullscreen = async () => {
    const fullscreen = await appWindow.isFullscreen();
    const maximized = await appWindow.isMaximized();

    if (!fullscreen && maximized) {
      await appWindow.unmaximize();
      setTimeout(() => appWindow.setFullscreen(true), 50);
    } else {
      appWindow.setFullscreen(!fullscreen);
    }
  };

  // Sync state on mount + listen to window events
  onMount(async () => {
    setIsFullscreen(await appWindow.isFullscreen());
    setIsMaximized(await appWindow.isMaximized());

    await listen('tauri://fullscreen', () => setIsFullscreen(true));
    await listen('tauri://enter-fullscreen', () => setIsFullscreen(true));
    await listen('tauri://exit-fullscreen', () => setIsFullscreen(false));

    await listen('tauri://maximize', () => setIsMaximized(true));
    await listen('tauri://unmaximize', () => setIsMaximized(false));
    await listen('tauri://minimize', () => console.log('Window minimized'));

    await listen('tauri://resize', async () => {
      const max = await appWindow.isMaximized();
      setIsMaximized(max);
    });
  });

  // F11 toggle
  window.addEventListener("keydown", (e) => {
    if (e.key === "F11") {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  return (
    <div data-tauri-drag-region class="titlebar">
      <Show when={!isFullscreen()}>
        <button onClick={() => appWindow.minimize()} class="titlebar-button z-9999" id="titlebar-minimize">
          <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
        </button>

        <button
          onClick={async () => {
            await appWindow.toggleMaximize();
            const max = await appWindow.isMaximized();
            setIsMaximized(max);
          }}
          class="titlebar-button z-9999"
          id="titlebar-maximize"
        >
          <Show when={!isMaximized()}>
            <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
          </Show>
          <Show when={isMaximized()}>
            <img src="https://api.iconify.design/mdi:window-restore.svg" alt="restore" />
          </Show>
        </button>

        <button onClick={() => appWindow.close()} class="titlebar-button z-9999" id="titlebar-close">
          <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </button>
      </Show>
    </div>
  );
}
