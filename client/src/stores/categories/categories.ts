import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';

interface CategoriesStoreInterface {
  createCategories(categories: Category[]);
  assignWordToCategories(wordId: number, categoriesIds: number[]);
  removeWordFromCategories(wordId: number);

  getIds(): number[];
  getCategoriesByWordId(wordId: number): number[];
  getWordIdsByCategoryId(catId: number): number[];
  getWordsWithNullCategory(wordsIds): number[];
}

interface CategoriesStoreValue {
  [key: number]: Category;
}

const store = createStore<CategoriesStoreInterface,CategoriesStoreValue >(
  getInitialState().initialData.categories,
  ($categories: CategoriesStoreValue) => ({
    createCategories(categories: Category[]) {
      for (let i = 0; i < categories.length; i++) {
        const catId = categories[i].categoryId;
        $categories[catId] = {
          ...categories[i],
          words: []
        };
      }
    },
    assignWordToCategories(wordId: number, categoriesIds: number[]) {
      for (let i = 0; i < categoriesIds.length; i++) {
        const cat = $categories[categoriesIds[i]];

        if (!cat) {
          continue;
        }

        if (cat.words.indexOf(wordId) === -1) {
          cat.words.push(wordId);
        }
      }
    },
    removeWordFromCategories(wordId: number) {
      const categoriesList = Object.values($categories);
      for (let i = 0; i < categoriesList.length; i++) {
        const cat = categoriesList[i];
        cat.words = cat.words.filter(w => w !== wordId);
      }
    }
  }),
  ($categories: CategoriesStoreValue) => ({
    getIds(): number[] {
      return Object.keys($categories).map(Number);
    },

    getCategoriesByWordId(wordId: number): number[] {
      return Object.values($categories).filter(cat => {
        return cat.words.find(w => w === wordId);
      }).map(cat => cat.categoryId);
    },

    getWordIdsByCategoryId(catId: number): number[] {
      return $categories[catId].words;
    },

    getWordsWithNullCategory(wordsIds: number[]): number[] {
      const idsInCategories = Object.values($categories).reduce((carry, cat) => {
        carry.push(...cat.words);
        return carry;
      }, []);

      return wordsIds.filter(wordId => {
        return idsInCategories.indexOf(+wordId) === -1;
      });
    }
  })
);

export default store;
