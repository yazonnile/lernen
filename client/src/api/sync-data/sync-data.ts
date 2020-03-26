import request from 'lib/request/request';
import syncManager from 'api/sync-manager/sync-manager';
import { words, categories, sync, messages, view, user } from 'stores';

export const syncCallback = (response: ResponseData) => {
  if (response && response.syncResult) {
    const {
      categoriesMap, wordsMap,
      notValidCategories = [], notValidWords = []
    } = response.syncResult;

    // handle not valid data only on sync page
    if (view.isSyncView()) {
      if (notValidCategories.length) {
        messages.addMessage({ text: 'notValidCategories.error' + notValidCategories.join(','), status: 'error', persistent: true });
      }

      if (notValidWords.length) {
        messages.addMessage({ text: 'notValidWords.error' + notValidWords.join(','), status: 'error', persistent: true });
      }
    }

    // update stores with real categories ids
    words.updateWordsCategories(categoriesMap);
    categories.updateCategoriesIds(categoriesMap);

    // update stores with real words ids
    words.updateWordsIds(wordsMap);

    // reset sync local data
    sync.reset();
  }
};

export const syncData = (() => {
  const f = () => {
    return (sync.syncRequired() && user.getId())
      ? request({ api: 'syncData', payload: syncManager.getDataToSync() })
        .then(syncCallback)
        .catch(() => {
          console.warn('error sync');
        })
      : Promise.resolve();
  };

  let syncTimer;

  // sync data when sync store changes
  sync.subscribe(() => {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(f, 10000);
  });

  return f;
})();

