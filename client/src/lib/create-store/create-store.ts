import { Writable, writable, get } from 'svelte/store';

export default <StoreInterface, StoreValue>(initialValue, methods): Writable<StoreValue> & StoreInterface => {
  const store: Writable<StoreValue> = writable(initialValue);

  const publicApi = {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
  };

  const setValue = (value) => {
    if (Array.isArray(value)) {
      publicApi.set([...value] as any);
    } else if (typeof value === 'object' && value !== null) {
      publicApi.set({ ...value } as any);
    } else {
      publicApi.set(value);
    }
  };

  Object.keys(methods()).forEach(method => {
    publicApi[method] = (...args) => {
      const storeValue = get(store);
      const result = methods(storeValue)[method].apply(null, args);
      setValue(typeof result === 'undefined' ? storeValue : result);
    }
  });

  return publicApi as any;
}
