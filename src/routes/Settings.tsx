export default function About() {
  return (
    <div>
      <div class="bg-background-light-3 rounded-xl px-8 py-12 w-max center flex-col">
        <h1 class="text-4xl text-accent text-center text-nowrap mb-8">About Focus Clock</h1>

        <div class="flex flex-col gap-4 mb-4 h-min w-full items-center content-center max-w-md text-center">
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
            <li>Modern UI: Clean and intuitive interface</li>
          </ul>
          <p class="text-sm text-gray-400 mt-4">
            Version 0.1.0 | Built with Tauri and SolidJS
          </p>
        </div>
      </div>
    </div>
  );
}
