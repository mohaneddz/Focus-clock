import { createSignal } from "solid-js";

export type Toast = { id: number; message: string; tone: "success" | "info" | "error" };

const [toasts, setToasts] = createSignal<Toast[]>([]);
export { toasts };

let counter = 0;
export const toast = (message: string, tone: Toast["tone"] = "success") => {
  const id = ++counter;
  setToasts((list) => [...list, { id, message, tone }]);
  setTimeout(() => setToasts((list) => list.filter((entry) => entry.id !== id)), 2600);
};
