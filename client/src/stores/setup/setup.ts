import { Writable, writable } from 'svelte/store';
import { getInitialState } from 'api/initial-state/initial-state';

const store: Setup & Writable<Setup> = writable(getInitialState().initialData.setup) as any;

export default store;
