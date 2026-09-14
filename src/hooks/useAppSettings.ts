import { createSignal } from 'solid-js';
import { isEnabled, enable, disable } from '@tauri-apps/plugin-autostart';
import { setStoreValue, getStoreValue } from '@/config/store';

const [closeToTray, setCloseToTraySignal] = createSignal(false);
const [startMinimized, setStartMinimizedSignal] = createSignal(false);
const [launchAtStartup, setLaunchAtStartupSignal] = createSignal(false);
const [isLoaded, setIsLoaded] = createSignal(false);

export default function useAppSettings() {
	const loadSettings = async () => {
		if (isLoaded()) return;

		const [storedCloseToTray, storedStartMinimized, autostartEnabled] = await Promise.all([
			getStoreValue<boolean>('closeToTray'),
			getStoreValue<boolean>('startMinimized'),
			isEnabled(),
		]);

		setCloseToTraySignal(storedCloseToTray ?? false);
		setStartMinimizedSignal(storedStartMinimized ?? false);
		setLaunchAtStartupSignal(autostartEnabled);
		setIsLoaded(true);
	};

	const setCloseToTray = async (value: boolean) => {
		setCloseToTraySignal(value);
		await setStoreValue('closeToTray', value);
	};

	const setStartMinimized = async (value: boolean) => {
		setStartMinimizedSignal(value);
		await setStoreValue('startMinimized', value);
	};

	const setLaunchAtStartup = async (value: boolean) => {
		setLaunchAtStartupSignal(value);
		if (value) {
			await enable();
		} else {
			await disable();
		}
	};

	return {
		loadSettings,
		closeToTray,
		setCloseToTray,
		startMinimized,
		setStartMinimized,
		launchAtStartup,
		setLaunchAtStartup,
	};
}
