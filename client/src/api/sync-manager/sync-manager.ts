import syncStore, { SyncTypes } from 'stores/sync/sync';

syncStore.subscribe($store => {
  console.log('syncStore >> ', $store);
});

class SyncManager {
  syncSetup() {
    syncStore.syncSetup();
  }

  private sync(id: number, type: SyncTypes) {
    if (id && !syncStore.isNew(id, type)) {
      // update in case of existing is and its NOT new
      syncStore.update(id, type);
      return id;
    }

    // create a new id instead
    const newId = +(Math.random() * 100000).toFixed();
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
}

export default new SyncManager();
