import { onMount } from "solid-js";
import SelectInput from "@/components/core/Input/SelectInput";
import useAppSettings from "@/hooks/useAppSettings";

const toggleOptions = [
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

export default function Settings() {
  const {
    loadSettings,
    closeToTray,
    setCloseToTray,
    startMinimized,
    setStartMinimized,
    launchAtStartup,
    setLaunchAtStartup,
  } = useAppSettings();

  onMount(loadSettings);

  return (
    <div>
      <div class="bg-background-light-3 rounded-xl px-8 py-12 w-max center flex-col">
        <h1 class="text-4xl font-bold text-accent text-center text-nowrap mb-8">Settings</h1>

        <div class="flex flex-col gap-4 mb-8 h-min w-full items-center content-center">
          <div class="w-full flex gap-4 items-center justify-between">
            <label for="launch-at-startup" class="text-start justify-self-start">Start at Windows startup</label>
            <SelectInput
              id="launch-at-startup"
              selected={launchAtStartup() ? "enabled" : "disabled"}
              options={toggleOptions}
              onChange={(val) => setLaunchAtStartup(val === "enabled")}
            />
          </div>

          <div class="w-full flex gap-4 items-center justify-between">
            <label for="close-to-tray" class="text-start justify-self-start">Close to tray</label>
            <SelectInput
              id="close-to-tray"
              selected={closeToTray() ? "enabled" : "disabled"}
              options={toggleOptions}
              onChange={(val) => setCloseToTray(val === "enabled")}
            />
          </div>

          <div class="w-full flex gap-4 items-center justify-between">
            <label for="start-minimized" class="text-start justify-self-start">Start minimized</label>
            <SelectInput
              id="start-minimized"
              selected={startMinimized() ? "enabled" : "disabled"}
              options={toggleOptions}
              onChange={(val) => setStartMinimized(val === "enabled")}
            />
          </div>
        </div>

        <div class="flex flex-col gap-4 mb-4 h-min w-full items-center content-center max-w-md text-center">
          <h2 class="text-2xl font-bold text-accent">About</h2>
          <p class="text-lg">
            Focus Clock is a productivity app designed to help you stay focused and manage your time effectively.
          </p>
          <p>
            Features include:
          </p>
          <ul class="list-disc list-inside text-left">
            <li>Pomodoro Timer: Work in focused intervals with breaks</li>
            <li>Custom Timers: Create and manage your own timers</li>
            <li>Persistent Storage: Your timers and settings are saved locally</li>
            <li>System Tray: Runs quietly in the background</li>
          </ul>
          <p class="text-sm text-gray-400 mt-4">
            Version 1.0.0 | Built with Tauri and SolidJS
          </p>
        </div>
      </div>
    </div>
  );
}
