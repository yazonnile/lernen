import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';
import games from 'stores/games/games';
import setupStore from 'stores/setup/setup';
import categoriesStore from 'stores/categories/categories';

interface WordsStoreInterface {
  deleteWords(ids: number[]);
  disableWords(ids: number[]);
  enableWords(ids: number[]);

  getWordsByCategoriesAndSetup(gameName: string): Word[];
}

const store = createStore<WordsStoreInterface, { [key: number]: Word }>(
  getInitialState().initialData.words,
  $words => ({
    deleteWords(ids: number[]) {
      for (let i = 0; i < ids.length; i++) {
        delete $words[ids[i]];
      }
    },
    disableWords(ids: number[]) {
      for (let i = 0; i < ids.length; i++) {
        $words[ids[i]].active = false;
      }
    },
    enableWords(ids: number[]) {
      for (let i = 0; i < ids.length; i++) {
        $words[ids[i]].active = true;
      }
    }
  }),
  $words => ({
    getWordsByCategoriesAndSetup(gameName: string): Word[] {
      const { categoriesIds, nullCategory } = games.getGamesCategories(gameName);
      const setup = setupStore.getSetup();

      let wordsIds = [];

      // add selected categories
      categoriesIds.forEach(catId => {
        const wordsInCategory = categoriesStore.getWordIdsByCategoryId(catId);
        wordsIds.push(...wordsInCategory);
      });

      // null category
      if (nullCategory) {
        wordsIds.push(...categoriesStore.getWordsWithNullCategory(Object.keys($words)));
      }

      // get uniq words array
      wordsIds = wordsIds.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

      // filter words by setup and active state
      wordsIds = wordsIds.filter(wordId => {
        const word: Word = $words[wordId];

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
  })
);

export default store;
