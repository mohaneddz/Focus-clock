import { For } from "solid-js";

interface Props {
    options?: Array<{ value: string | number; label: string }>;
    class?: string;
    selected?: string | number;
    onChange?: (value: string | number) => void;
    id?: string;
    background?: string;
}

export default function SelectInput(props: Props) {
    const background = props.background ?? " bg-[#445f6b]";
    return (
        <select
            id={props.id}
            class={`justify-self-end p-2 border h-full border-[#5c6b71] text-sm text-text rounded-md ${background} overflow-y-auto resize-none ${props.class}`}
            onChange={(e) => props.onChange?.(e.currentTarget.value)}
        >
            <For each={props.options}>
                {(option) => (
                    <option
                        value={option.value}
                        selected={option.value === props.selected}
                        class="text-sm text-text-light-2 bg-background-light-3"
                    >
                        {option.label}
                    </option>
                )}
            </For>
        </select>
    );
};
