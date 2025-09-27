import { createSignal } from 'solid-js';
import { setStoreValue, getStoreValue } from '@/config/store';

// Define an interface for the settings object
interface PomodoroSettings {
	pomodoroTimeSeconds: number;
	shortBreakTimeSeconds: number;
	longBreakTimeSeconds: number;
	audioEnabled: boolean;
	numberOfRounds: number;
}

// Global state for the Pomodoro timer
const [pomodoroTime, setPomodoroTime] = createSignal(25 * 60);
const [shortBreakTime, setShortBreakTime] = createSignal(5 * 60);
const [longBreakTime, setLongBreakTime] = createSignal(15 * 60);
const [audioEnabled, setAudioEnabled] = createSignal(true);
const [numberOfRounds, setNumberOfRounds] = createSignal(4);

const [turn, setTurn] = createSignal(0);

const [isActive, setIsActive] = createSignal(false);
const [timeLeft, setTimeLeft] = createSignal(25 * 60);
const [intervalId, setIntervalId] = createSignal<NodeJS.Timeout | null>(null);
const [isInitialized, setIsInitialized] = createSignal(false);
const [pomodorosCompleted, setPomodorosCompleted] = createSignal(0);

export default function usePomodoro() {
	const getCurrentTimerDuration = () => {
		if (turn() === 0) {
			return pomodoroTime();
		} else if (turn() === 1) {
			if (pomodorosCompleted() > 0 && pomodorosCompleted() % numberOfRounds() === 0) {
				return longBreakTime();
			}
			return shortBreakTime();
		} else {
			return longBreakTime();
		}
	};

	const formatTimeLeft = () => {
		const totalSeconds = timeLeft();
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = totalSeconds % 60;
		return `${String(m + h * 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	};

	const handleTimerComplete = () => {
		// Play audio notification if enabled
		if (audioEnabled()) {
			try {
				const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();

				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);

				oscillator.frequency.value = 800;
				oscillator.type = 'sine';

				gainNode.gain.setValueAtTime(0, audioContext.currentTime);
				gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
				gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

				oscillator.start(audioContext.currentTime);
				oscillator.stop(audioContext.currentTime + 0.5);
			} catch (error) {
				console.log('Audio notification failed:', error);
			}
		}

		if (turn() === 0) {
			setPomodorosCompleted(pomodorosCompleted() + 1);

			if (pomodorosCompleted() % numberOfRounds() === 0) {
				setTurn(2);
			} else {
				setTurn(1);
			}
		} else {
			setTurn(0);
		}
		const nextDuration = getCurrentTimerDuration();
		setTimeLeft(nextDuration);
		setIsActive(true);
		return nextDuration;
	};

	const resetTimer = () => {
		setTimeLeft(getCurrentTimerDuration());
	};

	const handleStop = () => {
		setIsActive(false);
		if (intervalId()) {
			clearInterval(intervalId()!);
			setIntervalId(null);
		}
		// Reset to the beginning of current phase
		resetTimer();
	};

	const handleReset = () => {
		setIsActive(false);
		if (intervalId()) {
			clearInterval(intervalId()!);
			setIntervalId(null);
		}
		// Reset to pomodoro phase and round count
		setTurn(0);
		setPomodorosCompleted(0);
		resetTimer();
	};

	const handlePlay = () => {
		if (isActive()) {
			// Pause the timer
			setIsActive(false);
			if (intervalId()) {
				clearInterval(intervalId()!);
				setIntervalId(null);
			}
		} else {
			// Start the timer
			setIsActive(true);
			setIntervalId(
				setInterval(() => {
					setTimeLeft((prev) => {
						if (prev <= 1) {
							// Timer finished
							return handleTimerComplete();
						}
						return prev - 1;
					});
				}, 1000)
			);
		}
	};

	const handleSkip = () => {
		if (isActive()) {
			handleStop();
		}
		// If skipping from pomodoro, increment pomodorosCompleted
		if (turn() === 0) {
			setPomodorosCompleted(pomodorosCompleted() + 1);
			if (pomodorosCompleted() % numberOfRounds() === 0) {
				setTurn(2); // long break
			} else {
				setTurn(1); // short break
			}
		} else {
			setTurn(0);
		}
		setTimeLeft(getCurrentTimerDuration());
	};

	async function saveSettings() {
		const settings: PomodoroSettings = {
			pomodoroTimeSeconds: pomodoroTime(),
			shortBreakTimeSeconds: shortBreakTime(),
			longBreakTimeSeconds: longBreakTime(),
			audioEnabled: audioEnabled(),
			numberOfRounds: numberOfRounds(),
		};
		try {
			await setStoreValue('pomodoro-settings', settings);
			console.log('Settings saved:', settings);
		} catch (error) {
			console.error('Failed to save settings:', error);
		}
	}

	async function getSettings() {
		try {
			// Use the <PomodoroSettings> generic to type the return value
			const settings = await getStoreValue<PomodoroSettings>('pomodoro-settings');

			if (settings) {
				console.log('Settings loaded:', settings);

				// No more errors here!
				setPomodoroTime(settings.pomodoroTimeSeconds);
				setShortBreakTime(settings.shortBreakTimeSeconds);
				setLongBreakTime(settings.longBreakTimeSeconds);
				setAudioEnabled(settings.audioEnabled);
				setNumberOfRounds(settings.numberOfRounds);

				console.log('Settings loaded successfully');
			} else {
				console.log('No saved settings found, using defaults');
			}

			// Initialize timer after loading settings
			if (!isInitialized()) {
				resetTimer();
				setIsInitialized(true);
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
			// Initialize with defaults if loading fails
			if (!isInitialized()) {
				resetTimer();
				setIsInitialized(true);
			}
		}
	}

	return {
		// Settings functions
		saveSettings,
		getSettings,

		// Timer controls
		handlePlay,
		handleStop,
		handleReset,
		resetTimer,

		// State getters
		isActive,
		timeLeft,
		turn,
		formatTimeLeft,
		getCurrentTimerDuration,

		// Settings getters
		pomodoroTime: () => pomodoroTime(),
		shortBreakTime: () => shortBreakTime(),
		longBreakTime: () => longBreakTime(),
		audioEnabled: () => audioEnabled(),

		// Settings setters
		setPomodoroTime,
		setShortBreakTime,
		setLongBreakTime,
		setAudioEnabled,
		handleSkip,
		numberOfRounds,
		setNumberOfRounds,
		pomodorosCompleted,
	};
};