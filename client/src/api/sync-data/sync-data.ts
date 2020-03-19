import request from 'lib/request/request';
import syncManager from 'api/sync-manager/sync-manager';
import { words, categories, sync, messages, view } from 'stores';

export const syncCallback = (response: ResponseData) => {
  if (response && response.syncResult) {
    const {
      categoriesMap, wordsMap,
      notValidNewCategories = [], notValidUpdatedCategories = [],
      notValidNewWords = [], notValidUpdatedWords = []
    } = response.syncResult;

    // handle not valid data only on sync page
    if (view.isSyncView()) {
      if (notValidNewCategories.length) {
        messages.addMessage({ text: 'notValidNewCategories.error' + notValidNewCategories.join(','), status: 'error', persistent: true });
      }

      if (notValidUpdatedCategories.length) {
        messages.addMessage({ text: 'notValidUpdatedCategories.error' + notValidUpdatedCategories.join(','), status: 'error', persistent: true });
      }

      if (notValidNewWords.length) {
        messages.addMessage({ text: 'notValidNewWords.error' + notValidNewWords.join(','), status: 'error', persistent: true });
      }

      if (notValidUpdatedWords.length) {
        messages.addMessage({ text: 'notValidUpdatedWords.error' + notValidUpdatedWords.join(','), status: 'error', persistent: true });
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

export const syncData = () => {
  request({ api: 'syncData', payload: syncManager.getDataToSync() }).then(syncCallback);
};
