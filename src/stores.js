import { writable } from 'svelte/store';

export const selectedParty = writable(null);
export const currentTask = writable(0);