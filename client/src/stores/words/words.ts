import createStore from 'lib/create-store/create-store';
import syncManager from 'api/sync-manager/sync-manager';
import games from 'stores/games/games';
import userStore from 'stores/user/user';

interface WordsStore {
  [key: number]: Word;
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
  deleteCategoryIdFromWords(this: WordsStore, categoryId: number) {
    const wordIds = Object.keys(this).map(Number);
    for (let i = 0; i < wordIds.length; i++) {
      const wordCategories = this[wordIds[i]].categories;

      if (wordCategories.includes(categoryId)) {
        this[wordIds[i]].categories.splice(
          wordCategories.indexOf(categoryId), 1
        );
      }
    }
  },
  unChainWordWithCategoryId(this: WordsStore, wordId: number, categoryId: number) {
    this[wordId].categories.splice(
      this[wordId].categories.indexOf(categoryId), 1
    );

    syncManager.syncWord(wordId);
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
  getWordsByCategoryId(this: WordsStore, categoryId: number): number[] {
    return Object.values(this).filter(word => {
      return word.categories.includes(categoryId);
    }).map(word => word.wordId)
  },
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
  },

  wordExists(this: WordsStore, word: Word): boolean {
    const words = Object.values(this);
    for (let i = 0; i < words.length; i++) {
      if (words[i].type === word.type && words[i].original === word.original) {
        return true;
      }
    }

    return false;
  },

  getWordsByLetters(this: WordsStore, word: Word): { [key: string]: number[] } {
    const notSortedMap = Object.values(this).reduce((carry, word: Word) => {
      const firstLetter = word.original[0].toUpperCase();

      if (!carry[firstLetter]) {
        carry[firstLetter] = [];
      }

      carry[firstLetter].push(word.wordId);

      return carry;
    }, {});

    const sortedMap = {};
    Object.keys(notSortedMap).forEach(letter => {
      const wordsIds = notSortedMap[letter];
      sortedMap[letter] = wordsIds.sort((a, b) => {
        a = this[a].original.toLowerCase();
        b = this[b].original.toLowerCase();
        return a > b ? 1 : (a < b ? -1 : 0);
      });
    });

    return sortedMap;
  }
};

const store = createStore<WordsStore, typeof storeMethods, typeof storeViews>(
  {}, storeMethods, storeViews
);

export default store;
