import Button from "@/components/core/Input/Button";

import TimeInput from "@/components/core/Input/TimeInput";
import SelectInput from "@/components/core/Input/SelectInput";
import usePomodoro from "@/hooks/usePomodoro";

interface Props {
  setPage: (page: "main" | "settings") => void;
  settings: () => PomodoroSettings;
}

export default function PomodoroSettings(props: Props) {
  const {
    saveSettings,
    setPomodoroTime,
    setShortBreakTime,
    setLongBreakTime,
    setAudioEnabled,
    setNumberOfRounds,
  } = usePomodoro();

  return (
    <div>

      <div class="bg-background-light-3 rounded-xl px-8 py-12 w-max center flex-col">
        <h1 class="text-4xl text-accent text-center text-nowrap mb-8">Pomodoro Settings</h1>

        <div class="flex flex-col gap-4 mb-4 h-min w-full items-center content-center">

          {/* Pomodoro Time */}
          <div class="w-full flex gap-4 items-center justify-between">
            <label for="pomodoro-time" class="text-start justify-self-start">Pomodoro Time</label>
            <TimeInput
              id="pomodoro-time"
              class="justify-self-end p-2 rounded"
              value={props.settings().pomodoroTimeSeconds}
              onChange={(val: number) => setPomodoroTime(val)}
            />
          </div>

          {/* Short Break */}
          <div class="w-full flex gap-4 items-center justify-between">
            <label for="pomodoro-break" class="text-start justify-self-start">Short Break</label>
            <TimeInput
              id="pomodoro-break"
              class="justify-self-end p-2 rounded"
              value={props.settings().shortBreakTimeSeconds}
              onChange={(val: number) => setShortBreakTime(val)}
            />
          </div>

          {/* Long Break */}
          <div class="w-full flex gap-4 items-center justify-between">
            <label for="pomodoro-long-break" class="text-start justify-self-start">Long Break</label>
            <TimeInput
              id="pomodoro-long-break"
              class="justify-self-end p-2 rounded"
              value={props.settings().longBreakTimeSeconds}
              onChange={(val: number) => setLongBreakTime(val)}
            />
          </div>

          {/* Audio */}
          <div class="w-full flex gap-4 items-center justify-between">
            <label for="pomodoro-audio" class="text-start justify-self-start">Audio</label>
            <SelectInput
              id="pomodoro-audio"
              class="justify-self-end p-2 rounded"
              options={[
                { value: "enabled", label: "Enabled" },
                { value: "disabled", label: "Disabled" },
              ]}
              selected={props.settings().audioEnabled ? "enabled" : "disabled"}
              onChange={(val: string | number) => setAudioEnabled(val === "enabled")}
            />
          </div>

          {/* Number of Rounds */}
          <div class="w-full flex gap-4 items-center justify-between">
            <label for="pomodoro-rounds" class="text-start justify-self-start text-nowrap">Number of Rounds</label>
            <input
              id="pomodoro-rounds"
              class="justify-self-end p-2 mr-2 rounded w-16 bg-[#445f6b]"
              type="number"
              min="1"
              value={props.settings().numberOfRounds}
              onInput={(e) => setNumberOfRounds(Number((e.currentTarget as HTMLInputElement).value))}
            />
          </div>

          {/* Buttons */}
          <div class="grid grid-cols-2 w-full justify-stretch items-start gap-8 mt-8">
            <Button
              variant="basic"
              class="w-full text-center"
              onClick={() => props.setPage("main")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              class="w-full text-center"
              onClick={() => {
                saveSettings();
                props.setPage("main");
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
