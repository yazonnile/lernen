import { syncCallback } from 'api/sync-data/sync-data';
import syncManager from 'api/sync-manager/sync-manager';
import request from 'lib/request/request';
import { words, categories, sync, storage, user, view } from 'stores';

interface LoadInitialData {
  callback?();
  payload?: object;
}

export const loadInitialData = ({ callback, payload = {} }: LoadInitialData) => {
  let initialData;
  try {
    initialData = JSON.parse(localStorage.getItem('lernen-storage'));
  } catch (e) { }

  if (initialData) {
    sync.set(initialData.sync);
    words.set(initialData.words || {});
    categories.set(initialData.categories || {});

    if (initialData.view) {
      view.set(initialData.view);
    } else {
      view.home();
    }

    if (initialData.user) {
      user.set(initialData.user);
    } else {
      user.resetSetup();
    }
  }

  request({
    api: 'getInitialData',
    payload: {
      ...syncManager.getDataToSync(),
      ...payload
    }
  }).then((response: ResponseData) => {
    syncCallback(response);

    if (response) {
      words.set(response.words || {});
      categories.set(response.categories || {});
      user.set(response.user);
    }

    // subscribe to storage change to sync storage with browser
    storage.subscribe($store => {
      localStorage.setItem('lernen-storage', JSON.stringify($store));
    });

    callback && callback();
  });
};
