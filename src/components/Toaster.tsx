import { For } from "solid-js";
import { toasts } from "@/config/toast";

export default function Toaster() {
  return <div class="toaster" aria-live="polite"><For each={toasts()}>{(entry) => <div class={`toast ${entry.tone}`}>{entry.message}</div>}</For></div>;
}
