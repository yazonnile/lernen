import createStore from 'lib/create-store/create-store';
import syncManager from 'api/sync-manager/sync-manager';
import games from 'stores/games/games';
import userStore from 'stores/user/user';

interface WordsStore {
  [key: number]: Word
}

const storeMethods = {
  deleteWords(this: WordsStore, ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      delete this[syncManager.deleteWord(ids[i])];
    }
  },
  disableWords(this: WordsStore, ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      this[syncManager.syncWord(ids[i])].active = false;
    }
  },
  enableWords(this: WordsStore, ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      this[syncManager.syncWord(ids[i])].active = true;
    }
  },
  updateWord(this: WordsStore, word: Word) {
    const wordId = syncManager.syncWord(word.wordId);
    this[wordId] = { ...word, wordId };
  },
  updateWordsCategories(this: WordsStore, categoriesMap: { [key: number]: number }) {
    const words = Object.values(this);
    const oldCategoriesIds = Object.keys(categoriesMap).map(Number);

    for (let i = 0; i < words.length; i++) {
      const wordCategories = words[i].categories;
      for (let j = 0; j < oldCategoriesIds.length; j++) {
        const oldIndex = wordCategories.indexOf(oldCategoriesIds[j]);
        if (oldIndex > -1) {
          this[words[i].wordId].categories.splice(oldIndex, 1, categoriesMap[oldCategoriesIds[j]]);
        }
      }
    }
  },
  updateWordsIds(this: WordsStore, wordsMap: { [key: number]: number }) {
    const oldIds = Object.keys(wordsMap);
    for (let i = 0; i < oldIds.length; i++) {
      const oldId = oldIds[i];
      const newId = wordsMap[oldId];
      this[newId] = { ...this[oldId], wordId: newId };
      delete this[oldId];
    }
  }
};

const storeViews = {
  getWordsByCategoriesAndSetup(this: WordsStore, gameName: string): number[] {
    const { categoriesIds, nullCategory } = games.getGamesCategories(gameName);
    const setup = userStore.getSetup();

    return Object.values(this).filter(word => {
      // skip not active words
      if (!word.active) {
        return false;
      }

      if (!word.categories.length) {
        // skip non-categories words with not selected null category
        if (!nullCategory) {
          return false;
        }
      } else {
        let wordInSelectedCategories = false;
        for (let i = 0; i < word.categories.length; i++) {
          const wordCategory = word.categories[i];
          if (categoriesIds.indexOf(wordCategory) > -1) {
            wordInSelectedCategories = true;
            break;
          }
        }

        // skip words with not selected categories
        if (!wordInSelectedCategories) {
          return false;
        }
      }

      // final sort - by types in setup
      switch (word.type) {
        case 'other':
          return setup.other;

        case 'phrase':
          return setup.phrases;

        case 'noun':
          return setup.nouns;

        case 'verb':
          return setup.verbs;
      }
    }).map(word => word.wordId);
  },

  verbIsStrong(word: Word): boolean {
    return !!(word.strong1 || word.strong2 || word.strong3 || word.strong4 || word.strong5 || word.strong6);
  },

  verbIsIrregular(word: Word): boolean {
    return !!(word.irregular1 || word.irregular2);
  },

  getWordById(this: WordsStore, wordId: number): Word {
    return this[wordId];
  }
};

const store = createStore<WordsStore, typeof storeMethods, typeof storeViews>(
  {}, storeMethods, storeViews
);

export default store;
