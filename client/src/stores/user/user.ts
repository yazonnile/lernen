import syncManager from 'api/sync-manager/sync-manager';
import createStore from 'lib/create-store/create-store';

const storeMethods = {
  saveSetup(newSetup: User) {
    syncManager.syncSetup();
    return newSetup;
  },
  resetSetup() {
    return {
      voice: true,
      voiceSpeed: 10,
      phrases: true,
      soundPhrases: true,
      nouns: true,
      soundNouns: true,
      articles: true,
      soundArticles: true,
      plural: true,
      soundPlural: true,
      verbs: true,
      soundVerbs: true,
      strongVerbs: true,
      soundStrongVerbs: false,
      irregularVerbs: true,
      soundIrregularVerbs: false,
      other: true,
    }
  }
};

const storeViews = {
  getSetup(this: User): User {
    return this;
  },

  getId(this: User): number {
    return this.userId;
  }
};

const store = createStore<User, typeof storeMethods, typeof storeViews>(
  storeMethods.resetSetup(), storeMethods, storeViews
);

export default store;
