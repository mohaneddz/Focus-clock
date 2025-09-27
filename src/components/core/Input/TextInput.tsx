interface Props {
  id?: string;
  class?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}


export default function TextInput(props: Props) {
  return (
    <input
      id={props.id}
      type="text"
      class={`bg-[#445f6b] text-white focus:outline-none focus:ring-0 focus:border-none ${props.class}`}
      value={props.value}
      placeholder={props.placeholder}
      onInput={(e) => props.onChange?.((e.target as HTMLInputElement).value)}
    />
  );
}
