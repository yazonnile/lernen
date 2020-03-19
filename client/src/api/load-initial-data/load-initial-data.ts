import request from 'lib/request/request';
import { words, categories, sync, storage, user } from 'stores';

export const loadInitialData = (callback?) => {
  request({ api: 'getInitialData' }).then(response => {
    const wordsToStore = {};
    const categoriesToStore = {};

    // take loaded data
    if (response) {
      Object.assign(wordsToStore, response.words);
      Object.assign(categoriesToStore, response.categories);
    }

    // merge with storage data
    try {
      const initialData = JSON.parse(localStorage.getItem('lernen-storage'));
      if (initialData) {
        sync.set(initialData.sync);
        user.set(initialData.user);

        if (sync.syncRequired() || !response) {
          Object.assign(wordsToStore, initialData.words);
          Object.assign(categoriesToStore, initialData.categories);
        }
      }
    } catch (e) {}

    words.set(wordsToStore);
    categories.set(categoriesToStore);

    if (response) {
      callback && callback();
    }

    // subscribe to storage change to sync storage with browser
    storage.subscribe($store => {
      localStorage.setItem('lernen-storage', JSON.stringify($store));
    });
  });
};
