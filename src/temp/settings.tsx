import Button from "@/components/core/Input/Button";

import TimeInput from "@/components/core/Input/TimeInput";
import SelectInput from "@/components/core/Input/SelectInput";
import usePomodoro from "@/hooks/usePomodoro";


export default function Settings() {

  const { setPomodoroTime, setAudioEnabled, setNumberOfRounds } = usePomodoro();

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
              onChange={(val: number) => setPomodoroTime(val)}
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
              onInput={(e) => setNumberOfRounds(Number((e.currentTarget as HTMLInputElement).value))}
            />
          </div>

          {/* Buttons */}
          <div class="grid grid-cols-2 w-full justify-stretch items-start gap-8 mt-8">
            <Button
              variant="basic"
              class="w-full text-center"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              class="w-full text-center"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
