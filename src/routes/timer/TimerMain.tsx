import { Show } from "solid-js";
import Button from "@/components/core/Input/Button";

import Pause from "lucide-solid/icons/pause";
import Play from "lucide-solid/icons/play";
import RotateCcw from "lucide-solid/icons/rotate-ccw";

import useMainTimer from "@/hooks/useMainTimer";

export default function TimerMain() {

  const { title, remainingTime, isActive, formatTime, handlePlay, handleReset } = useMainTimer();

  return (
    <div class="center flex-col h-full w-full relative">
      <div class="center flex-col gap-4 mb-8 relative select-none">
        <p class="text-9xl lg:text-[25rem] non-selectable">{formatTime(remainingTime())}</p>
        <p class="text-xl lg:text-3xl non-selectable">{title()}</p>
      </div>

      <div class="absolute bottom-20 center flex-col gap-4">
        <div class="grid grid-cols-2 mt-4 gap-4">

          <Button class="center w-stretch p-8 text-36 bg-primary-dark" onClick={handlePlay}>
            <Show when={!isActive()}>
              <Play class="mr-2 text-36" size={24} /> START
            </Show>
            <Show when={isActive()}>
              <Pause class="mr-2 text-36" size={24} /> PAUSE
            </Show>
          </Button>

          <Button variant="secondary" class="center w-stretch p-8 text-36" onClick={handleReset}>
            <RotateCcw class="mr-2 text-36" size={24} /> RESET
          </Button>
        </div>

        <a class="text-lg text-gray-200/40 hover:select underline click select-none" href="/timer" >Back to Gallery</a>

      </div>
    </div>
  );
};
