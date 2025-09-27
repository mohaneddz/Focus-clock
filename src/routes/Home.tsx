import { createSignal, onMount, onCleanup } from 'solid-js';

export default function Home() {
  const [time, setTime] = createSignal(new Date());

  onMount(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(timer));
  });

  const formattedTime = () => time().toLocaleTimeString([], { hour12: false });

  return (
    <div class="center col gap-8">
      <div class="text-9xl lg:text-[15rem] font-bold">
        {formattedTime()}
      </div>
    </div>
  );
};
