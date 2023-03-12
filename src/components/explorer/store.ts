import { writable } from 'svelte/store';

export const currentSelectionKey = writable<string | null>(null);
