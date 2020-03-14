import { writable } from 'svelte/store';
import { getInitialState } from 'api/get-initial-state/get-initial-state';

export default writable(getInitialState().user || null);

