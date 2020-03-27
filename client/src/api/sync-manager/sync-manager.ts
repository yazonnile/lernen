import unique from 'lib/unique/unique';
import syncStore, { SyncTypes, SyncStore } from 'stores/sync/sync';
import wordsStore from 'stores/words/words';
import categoriesStore from 'stores/categories/categories';
import userStore from 'stores/user/user';

interface DataToSync extends SyncStore {
  data: {
    words: {
      [key: number]: Word;
    };
    categories: {
      [key: number]: Category;
    };
    setup: User;
  };
}

class SyncManager {
  syncSetup() {
    syncStore.syncSetup();
  }

  private sync(id: number, type: SyncTypes) {
    if (id) {
      // update in case of existing
      if (!syncStore.isNew(id, type)) {
        syncStore.update(id, type);
      }

      return id;
    }

    // create a new id instead
    const newId = +(Math.random() * 10000000).toFixed();
    syncStore.create(newId, type);
    return newId;
  }

  private delete(id: number, type: SyncTypes) {
    if (syncStore.isNew(id, type)) {
      syncStore.deleteFromCreated(id, type);
    } else {
      syncStore.delete(id, type);
      syncStore.deleteFromUpdated(id, type);
    }

    return id;
  }

  syncWord(wordId: number): number {
    return this.sync(wordId, SyncTypes.words);
  }

  deleteWord(wordId: number): number {
    return this.delete(wordId, SyncTypes.words);
  }

  syncCategory(categoryId: number): number {
    return this.sync(categoryId, SyncTypes.categories);
  }

  deleteCategory(categoryId: number): number {
    return this.delete(categoryId, SyncTypes.categories);
  }

  getDataToSync() {
    const dataToSync: DataToSync = { data: { words: {}, categories: {}, setup: {} } };
    const syncStoreData = syncStore.getData();

    // merge sync store into data
    Object.assign(dataToSync, syncStoreData);

    // save setup
    if (syncStoreData.setup) {
      dataToSync.data.setup = userStore.getSetup();
    }

    // save words models
    const wordsToUpdate = [...syncStoreData.words.toUpdate, ...syncStoreData.words.toCreate].filter(unique);
    for (let i = 0; i < wordsToUpdate.length; i++) {
      const wordId = wordsToUpdate[i];
      dataToSync.data.words[wordId] = wordsStore.getWordById(wordId);
    }

    // save categories models
    const categoriesToUpdate = [...syncStoreData.categories.toUpdate, ...syncStoreData.categories.toCreate].filter(unique);
    for (let i = 0; i < categoriesToUpdate.length; i++) {
      const categoryId = categoriesToUpdate[i];
      dataToSync.data.categories[categoryId] = categoriesStore.getCategoryById(categoryId);
    }

    return dataToSync;
  }
}

export default new SyncManager();
