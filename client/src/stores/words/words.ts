import createStore from 'lib/create-store/create-store';
import games from 'stores/games/games';
import userStore from 'stores/user/user';
import categoriesStore from 'stores/categories/categories';

interface WordsStore {
  [key: number]: Word
}

const storeMethods = {
  deleteWords(this: WordsStore, ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      delete this[ids[i]];
    }
  },
  disableWords(this: WordsStore, ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      this[ids[i]].active = false;
    }
  },
  enableWords(this: WordsStore, ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      this[ids[i]].active = true;
    }
  },
  updateWord(this: WordsStore, word: Word) {
    this[word.wordId] = word;
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
};

const store = createStore<WordsStore, typeof storeMethods, typeof storeViews>(
  {}, storeMethods, storeViews
);

export default store;
