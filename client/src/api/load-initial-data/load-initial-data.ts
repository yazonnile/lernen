import { syncCallback } from 'api/sync-data/sync-data';
import syncManager from 'api/sync-manager/sync-manager';
import request from 'lib/request/request';
import { words, categories, sync, storage, user, view, games } from 'stores';

interface LoadInitialData {
  callback?();
  payload?: object;
  loginAttempt?: boolean;
}

export const loadInitialData = ({ callback, payload = {}, loginAttempt }: LoadInitialData) => {
  if (!loginAttempt) {
    let storageData;
    try {
      storageData = JSON.parse(localStorage.getItem('lernen-storage'));
    } catch (e) {
      console.warn('Local storage parse error');
    }

    if (storageData) {
      sync.set(storageData.sync);
      words.set(storageData.words || {});
      categories.set(storageData.categories || {});

      if (storageData.gamesCategories) {
        games.update($games => {
          Object.keys(storageData.gamesCategories).forEach(gameId => {
            $games[gameId].categories = storageData.gamesCategories[gameId];
          }, {});

          return $games;
        });
      }

      if (storageData.view) {
        view.set(storageData.view);
      } else {
        view.home();
      }

      if (storageData.user) {
        user.set(storageData.user);
      } else {
        user.resetSetup();
      }
    }
  }

  const requestLoadOrDie = () => {
    if (!loginAttempt) {
      // subscribe to storage change to sync storage with browser
      storage.subscribe($store => {
        localStorage.setItem('lernen-storage', JSON.stringify($store));
      });
    }

    callback && callback();
  };

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
  }).then(requestLoadOrDie).catch(requestLoadOrDie);
};
