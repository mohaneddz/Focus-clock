import Plus from "lucide-solid/icons/plus";

export default function NewTimerCard({ onClick }: { onClick: () => void }) {
    return (
        <div class="p-6 border border-dashed border-primary-light-3 rounded-lg shadow-md flex justify-center col h-80 w-60 center col click" onClick={onClick}>

            <p class="text-2xl font-semibold text-primary-light-3 mb-4">New Timer</p>
            <Plus size={32} class="text-primary-light-3" />


        </div >
    );
};
