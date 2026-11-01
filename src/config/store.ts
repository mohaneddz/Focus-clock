import { load, Store } from '@tauri-apps/plugin-store';

let store: Store;
let initializing: Promise<Store> | undefined;

export const initStore = async (filename = 'store.json') => {
	if (store) return store;
	initializing ??= load(filename, {
        autoSave: true,
        defaults: {}
    }).then(value => (store = value)).catch(error => { initializing = undefined; throw error; });
	return initializing;
};

export const setStoreValue = async <T>(key: string, value: T): Promise<void> => {
	if (!store) await initStore();
	await store.set(key, value);
};

export const getStoreValue = async <T>(key: string): Promise<T | null> => {
	if (!store) {
		await initStore();
	}
	const value = await store.get<T>(key);
	return value ?? null;
};

export const deleteStoreKey = async (key: string): Promise<void> => {
	if (!store) throw new Error('Store not initialized');
	await store.delete(key);
};

export const clearStore = async (): Promise<void> => {
	if (!store) throw new Error('Store not initialized');
	await store.clear();
};

export const saveStore = async (): Promise<void> => {
	if (!store) throw new Error('Store not initialized');
	await store.save();
};

export const entries = async (): Promise<[string, any][]> => {
	if (!store) throw new Error('Store not initialized');
	return await store.entries();
};

export const keys = async (): Promise<string[]> => {
	if (!store) throw new Error('Store not initialized');
	return await store.keys();
};

export const values = async (): Promise<any[]> => {
	if (!store) throw new Error('Store not initialized');
	return await store.values();
};
