import usePomodoro from "@/hooks/usePomodoro";
import Button from "@/components/core/Input/Button"
import { Show } from "solid-js";

import Octagon from "lucide-solid/icons/octagon";
import Pause from "lucide-solid/icons/pause";
import Play from "lucide-solid/icons/play";
import RotateCcw from "lucide-solid/icons/rotate-ccw";


interface Props {
    setPage: (page: 'main' | 'settings') => void;
    settings: () => PomodoroSettings;
}

export default function PomodoroMain(props: Props) {

    const { isActive, formatTimeLeft, handlePlay, handleStop, handleReset, turn, handleSkip, pomodorosCompleted } = usePomodoro();

    const getPhaseText = () => {
        switch (turn()) {
            case 0: return "Focus on your task";
            case 1: return "Take a short break";
            case 2: return "Take a long break";
            default: return "Focus on your task";
        }
    };

    const getPhaseColor = () => {
        switch (turn()) {
            case 0: return "text-text";
            case 1: return "text-text-light-3";
            case 2: return "text-accent";
            default: return "text-text";
        }
    };

    const getPhase = () => {
        const number = pomodorosCompleted() % props.settings().numberOfRounds;
        if (number === 0 && pomodorosCompleted() > 0) {
            return props.settings().numberOfRounds; 
        }
        return number;
    };

    return (    
        <div class="center flex-col h-full w-full relative">

            <div class="center flex-col gap-4 mb-8 relative select-none hover:cursor-pointer click" >
                <p class={`lg:text-3xl absolute -right-8 -top-4 non-selectable ${getPhaseColor()}`}>{getPhase()}/{props.settings().numberOfRounds}</p>
                <p class={`text-9xl lg:text-[25rem] non-selectable clickable ${getPhaseColor()}`} onclick={handleSkip}>{formatTimeLeft()}</p>
                <p class={`text-xl lg:text-3xl non-selectable ${getPhaseColor()}`}>{getPhaseText()}</p>
            </div>

            <div class="absolute bottom-20 center flex-col gap-4">
                <div class="grid grid-cols-3 mt-4 gap-4">

                    <Button variant="secondary" class="center w-stretch p-8 text-36" onClick={handleStop}>
                        <Octagon class="mr-2 text-36" size={24} /> STOP
                    </Button>

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
                <p class="text-[0.8rem] text-gray-400/40 hover:select underline click select-none" onclick={() => props.setPage('settings')}>Pomodoro Settings</p>
            </div>
        </div>

    );
};
