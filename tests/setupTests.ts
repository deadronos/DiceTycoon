import { beforeEach, vi } from 'vitest';

type StorageMock = {
	clear: () => void;
	getItem: (key: string) => string | null;
	key: (index: number) => string | null;
	length: number;
	removeItem: (key: string) => void;
	setItem: (key: string, value: string) => void;
};

function createStorageMock(): StorageMock {
	const store = new Map<string, string>();

	return {
		clear: () => store.clear(),
		getItem: key => (store.has(key) ? store.get(key) ?? null : null),
		key: index => Array.from(store.keys())[index] ?? null,
		get length() {
			return store.size;
		},
		removeItem: key => {
			store.delete(key);
		},
		setItem: (key, value) => {
			store.set(key, String(value));
		},
	};
}

const localStorageMock = createStorageMock();

vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
	localStorageMock.clear();
});
