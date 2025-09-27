import { getStoreValue, setStoreValue } from '@/config/store';
import { createSignal, createEffect } from 'solid-js';

interface Timer {
	id: number;
	duration: number;
	title: string;
}

export default function useTimer() {

	const [timers, setTimers] = createSignal<Timer[]>([]);

	createEffect(async () => {
		const stored = await getStoreValue<Timer[]>('timers');
		setTimers((stored || []).filter((timer: Timer) => timer != null));
	});

	const [modalOpen, setModalOpen] = createSignal(false);
    const [newTimerModalOpen, setNewTimerModalOpen] = createSignal(false);
	const [editTimerModalOpen, setEditTimerModalOpen] = createSignal(false);
	
	const [editingTimer, setEditingTimer] = createSignal<Timer | null>(null);
	const [newTimerTitle, setNewTimerTitle] = createSignal('New Timer');
	const [newTimerDuration, setNewTimerDuration] = createSignal(25 * 60);

	const [editTimerTitle, setEditTimerTitle] = createSignal('');
	const [editTimerDuration, setEditTimerDuration] = createSignal(0);

	function saveTimer() {
		const newTimer = {
			id: Date.now(),
			title: newTimerTitle(),
			duration: newTimerDuration(),
		};
		setTimers(prev => [...prev, newTimer]);
		setStoreValue('timers', timers());
		setNewTimerModalOpen(false);
	}

	function saveEditTimer() {
		if (!editingTimer()) return;
		setTimers(prev => prev.map((timer: Timer) =>
			timer.id === editingTimer()!.id
				? { ...timer, title: editTimerTitle(), duration: editTimerDuration() }
				: timer
		));
		setStoreValue('timers', timers());
		setEditTimerModalOpen(false);
		setEditingTimer(null);
	}

	function deleteTimer(timerId: number) {
        console.log("Deleting timer with ID:", timerId);
		setTimers(prev => prev.filter((timer: Timer) => timer.id !== timerId));
		setStoreValue('timers', timers());
	}

	function openEditModal(timer: Timer) {
		setEditingTimer(timer);
		setEditTimerTitle(timer.title);
		setEditTimerDuration(timer.duration);
		setEditTimerModalOpen(true);
	}

	return {
		modalOpen,
		setModalOpen,
		newTimerModalOpen,
		setNewTimerModalOpen,
		editTimerModalOpen,
		setEditTimerModalOpen,
		editingTimer,
		setEditingTimer,
		newTimerTitle,
		setNewTimerTitle,
		newTimerDuration,
		setNewTimerDuration,
		editTimerTitle,
		setEditTimerTitle,
		editTimerDuration,
		setEditTimerDuration,
		timers,
		saveTimer,
		saveEditTimer,
		deleteTimer,
		openEditModal,
	};
}
