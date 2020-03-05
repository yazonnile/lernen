import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';
import { games, setup as setupStore, categories as categoriesStore } from 'stores';

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
      const wordsInCategory = categoriesStore.getWordsWithCategory();

      return categoriesIds.reduce((words, catId) => {
        return [ ...words, ...categoriesStore.getWordIdsByCategoryId(catId) ];
      }, [])

      // add null category if needed
      .concat(nullCategory
        ? Object.keys($words).map(Number).filter(wordId => {
          return wordsInCategory.indexOf(wordId) === -1;
        }) : []
      )

      // get uniq words array
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      })

      // filter words by setup
      .filter(wordId => {
        const word: Word = $words[wordId];

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
    }
  })
);

export default store;
