import { createSignal, onMount, onCleanup } from 'solid-js';

export default function Home() {
  const [time, setTime] = createSignal(new Date());

  onMount(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(timer));
  });

  const formattedTime = () => {
    const t = time();
    let hours = t.getHours();
    const minutes = t.getMinutes().toString().padStart(2, '0');
    const seconds = t.getSeconds().toString().padStart(2, '0');
    hours = hours % 12 || 12;
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div class="center col gap-8">
      <div class="text-9xl lg:text-[15rem] font-bold">
        {formattedTime()}
      </div>
    </div>
  );
};
