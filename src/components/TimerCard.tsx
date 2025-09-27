import Play from "lucide-solid/icons/play";
import Pen from "lucide-solid/icons/pen";
import Trash from "lucide-solid/icons/trash";

interface Props {
    id?: number;
    duration?: number; 
    title?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function TimerCard(props: Props) {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div class="relative p-6 bg-primary-light-3 rounded-lg shadow-md center col h-80 w-60">
            <button class="absolute top-2 right-2 text-white/40 hover:text-white click" onClick={props.onDelete}>
                <Trash size={16} />
            </button>
            <div class="text-4xl bg-primary p-4 rounded-lg mb-4 font-mono">{formatTime(props.duration || 0)}</div>

            <div class="text-lg font-semibold">{props.title || "Timer"}</div>

            <div class="flex gap-4 w-full justify-center items-center content-center">

                <a class="mt-4 bg-primary-light-2 rounded-full center aspect-square click h-16 w-16" href={`/timer/${props.id}`}>
                    <Play size={16} />
                </a>

                <button class="mt-4 bg-primary-light-2 rounded-full center aspect-square click h-16 w-16" onClick={props.onEdit}>
                    <Pen size={16} />
                </button>

            </div>

        </div >
    );
};
