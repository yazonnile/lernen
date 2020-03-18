import createStore from 'lib/create-store/create-store';

interface SyncType {
  toDelete: number[];
  toUpdate: number[];
  toCreate: number[];
}

interface SyncStore {
  words: SyncType;
  categories: SyncType;
  setup: boolean;
}

export enum SyncTypes {
  categories = 'categories',
  words = 'words',
}

const storeMethods = {
  syncSetup(this: SyncStore) {
    this.setup = true;
  },

  create(this: SyncStore, id: number, type: SyncTypes) {
    this[type].toCreate.push(id);
  },

  update(this: SyncStore, id: number, type: SyncTypes) {
    if (this[type].toUpdate.indexOf(id) === -1) {
      this[type].toUpdate.push(id);
    }
  },

  deleteFromCreated(this: SyncStore, id: number, type: SyncTypes) {
    this[type].toCreate = this[type].toCreate.filter(id => (id !== id));
  },

  deleteFromUpdated(this: SyncStore, id: number, type: SyncTypes) {
    this[type].toUpdate = this[type].toUpdate.filter(id => (id !== id));
  },

  delete(this: SyncStore, id: number, type: SyncTypes) {
    if (this[type].toDelete.indexOf(id) === -1) {
      this[type].toDelete.push(id);
    }
  },
};

const storeViews = {
  isNew(this: SyncStore, id: number, type: SyncTypes): boolean {
    return this[type].toCreate.indexOf(id) > -1;
  },

  syncRequired(this: SyncStore): boolean {
    const { words, categories } = this;
    return !!(words.toCreate.length || words.toDelete.length || words.toUpdate.length
      || categories.toCreate.length || categories.toDelete.length || categories.toUpdate.length);
  }
};

const store = createStore<SyncStore, typeof storeMethods, typeof storeViews>({
  words: { toCreate: [], toDelete: [], toUpdate: [] }, categories: { toCreate: [], toDelete: [], toUpdate: [] }, setup: false
}, storeMethods, storeViews);

export default store;
