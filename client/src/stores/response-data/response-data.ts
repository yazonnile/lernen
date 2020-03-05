import { getInitialState } from 'api/initial-state/initial-state';
import { Writable, writable, derived } from 'svelte/store';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { error, initialData, ...rest } = getInitialState();
const store: ResponseStore & Writable<ResponseStore> = writable(rest) as any;

export const user: User = derived(store, ($store, set) => {
  set($store.persistentData.user);
});

export default store;
