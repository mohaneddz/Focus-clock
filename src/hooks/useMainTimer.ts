import { useParams } from '@solidjs/router';
import { createSignal, onMount, onCleanup } from 'solid-js';
import { getStoreValue, setStoreValue } from '@/config/store';

export default function useMainTimer() {
	const params = useParams();
	const timerId = parseInt(params.id);

	const [remainingTime, setRemainingTime] = createSignal(0);
	const [totalTime, setTotalTime] = createSignal(0);
	const [title, setTitle] = createSignal('');
	const [isActive, setIsActive] = createSignal(false);

	let interval: number | undefined;

	onMount(async () => {
		const timers = (await getStoreValue<Timer[]>('timers')) || [];
		const timer = timers.find((t) => t.id === timerId);
		if (timer) {
			setTotalTime(timer.duration);
			setRemainingTime(timer.duration);
			setTitle(timer.title);
		}
	});

	onCleanup(() => {
		if (interval) clearInterval(interval);
	});

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	};

	const updateStore = async () => {
		const currentTimer: CurrentTimer = {
			id: timerId,
			remainingTime: remainingTime(),
			totalTime: totalTime(),
			title: title(),
		};
		await setStoreValue('currentTimer', currentTimer);
	};

	const startTimer = () => {
		if (remainingTime() <= 0) return;
		setIsActive(true);
		interval = setInterval(() => {
			setRemainingTime((prev) => {
				const newTime = prev - 1;
				if (newTime <= 0) {
					setIsActive(false);
					clearInterval(interval);
					return 0;
				}
				updateStore();
				return newTime;
			});
		}, 1000) as unknown as number;
	};

	const pauseTimer = () => {
		setIsActive(false);
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
		updateStore();
	};

	const resetTimer = () => {
		setIsActive(false);
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
		setRemainingTime(totalTime());
		updateStore();
	};

	const handlePlay = () => {
		if (isActive()) {
			pauseTimer();
		} else {
			startTimer();
		}
	};

	const handleReset = () => {
		resetTimer();
	};

	return {
		title, remainingTime, isActive, formatTime, handlePlay, handleReset
	};
}
