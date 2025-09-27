import { For } from "solid-js";

interface NavigationProps {
    onClick: () => void;
}

export default function Navigation({ onClick }: NavigationProps) {
    return (
        <div class="fixed top-0 left-0 right-0 bottom-0 bg-primary-dark/90 backdrop-blur-sm z-50 center col" onClick={onClick}>
            <For each={["Home", "Timer", "Pomodoro", "Settings"]} >
                {(item) => (
                    <a class="p-4 border-b border-primary-dark/50 text-5xl click" href={item === "Home" ? "/" : `/${item.toLowerCase()}`}>
                        {item}
                    </a>
                )}
            </For>
        </div >
    );
};
