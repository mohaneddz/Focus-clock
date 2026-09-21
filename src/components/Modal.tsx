import { JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";

interface Props {
  children?: JSX.Element | JSX.Element[];
  onClose?: () => void;
  show?: boolean;
}

export default function Modal(props: Props) {
  return <Portal>
    <div
      class={`fixed inset-0 flex items-center justify-center z-100 ${props.show ? "block" : "hidden"}`}
      style={{ background: "rgba(1, 11, 18, 0.82)", "backdrop-filter": "blur(10px)", "-webkit-backdrop-filter": "blur(10px)" }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) props.onClose?.(); }}
    >
      <div class="relative z-101 max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-auto rounded-lg border p-4 shadow-lg" style={{ background: "#082638", border: "1px solid #2a6c87", opacity: "1" }}>
        <button onClick={props.onClose} class="absolute top-2 right-2 text-gray-400 hover:text-text transition-colors" aria-label="Close modal">
          <X size={18} />
        </button>
        {props.children}
      </div>
    </div>
  </Portal>;
}
