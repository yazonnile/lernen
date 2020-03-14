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
  }
};

const storeViews = {
  getWordsByCategoriesAndSetup(this: WordsStore, gameName: string): Word[] {
    const { categoriesIds, nullCategory } = games.getGamesCategories(gameName);
    const setup = userStore.getSetup();

    let wordsIds = [];

    // add selected categories
    categoriesIds.forEach(catId => {
      const wordsInCategory = categoriesStore.getWordIdsByCategoryId(catId);
      wordsIds.push(...wordsInCategory);
    });

    // null category
    if (nullCategory) {
      wordsIds.push(
        ...categoriesStore.getWordsWithNullCategory(
          Object.keys(this).map(Number)
        )
      );
    }

    // get uniq words array
    wordsIds = wordsIds.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    // filter words by setup and active state
    wordsIds = wordsIds.filter(wordId => {
      const word: Word = this[wordId];

      if (!word.active) {
        return false;
      }

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
    });

    return wordsIds;
  }
};

const store = createStore<WordsStore, typeof storeMethods, typeof storeViews>(
  {}, storeMethods, storeViews
);

export default store;
