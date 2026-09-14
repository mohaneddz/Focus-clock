import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { getStoreValue } from "@/config/store";

const particles = Array.from({ length: 30 }, (_, index) => ({
  x: (index * 37 + 11) % 100,
  y: (index * 61 + 7) % 100,
  size: 1 + (index % 3) * 0.65,
  delay: -(index % 10) * 1.7,
  duration: 13 + (index % 7) * 2.3,
}));

export default function AmbientParticles() {
  const [visible, setVisible] = createSignal(true);

  onMount(async () => {
    try {
      setVisible((await getStoreValue<boolean>("ambientParticles")) ?? true);
    } catch {
      // Keep the default in a plain browser preview where the Tauri store is unavailable.
      setVisible(true);
    }
    const update = (event: Event) => setVisible((event as CustomEvent<boolean>).detail);
    window.addEventListener("ambient-particles-change", update);
    onCleanup(() => window.removeEventListener("ambient-particles-change", update));
  });

  return <Show when={visible()}><div class="ambient-particles" aria-hidden="true">
    <For each={particles}>{(particle) => <i style={`--particle-x:${particle.x}%;--particle-y:${particle.y}%;--particle-size:${particle.size}px;--particle-delay:${particle.delay}s;--particle-duration:${particle.duration}s`} />}</For>
  </div></Show>;
}
