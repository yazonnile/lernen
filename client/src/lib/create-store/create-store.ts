import { Writable, writable, get } from 'svelte/store';

const setValue = <V>(store: Writable<V>, value: V) => {
  if (Array.isArray(value)) {
    store.set([...value] as any);
  } else if (typeof value === 'object' && value !== null) {
    store.set({ ...value } as any);
  } else {
    store.set(value);
  }
};

export default <Value, Methods = {}, Views = {}>(initial: Value, methods?: Methods, views?: Views): Writable<Value> & Methods & Views & Value => {
  const store = writable(initial);

  const publicApi = {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
  };

  if (methods) {
    Object.keys(methods).forEach(method => {
      publicApi[method] = (...args) => {
        const storeValue = get(store);
        const result = methods[method].apply(storeValue, args);
        setValue(store, typeof result === 'undefined' ? storeValue : result);
      }
    });
  }

  if (views) {
    Object.keys(views).forEach(view => {
      publicApi[view] = (...args) => {
        const storeValue = get(store);
        return views[view].apply(storeValue, args);
      }
    });
  }

  return publicApi as any;
}
