import createStore from 'lib/create-store/create-store';

interface CategoriesStore {
  [key: number]: Category;
}

const storeMethods = {
  createCategories(this: CategoriesStore, categories: Category[]) {
    for (let i = 0; i < categories.length; i++) {
      const catId = categories[i].categoryId;
      this[catId] = {
        ...categories[i],
        words: []
      };
    }
  },
  assignWordToCategories(this: CategoriesStore, wordId: number, categoriesIds: number[]) {
    for (let i = 0; i < categoriesIds.length; i++) {
      const cat = this[categoriesIds[i]];

      if (!cat) {
        continue;
      }

      if (cat.words.indexOf(wordId) === -1) {
        cat.words.push(wordId);
      }
    }
  },
  removeWordFromCategories(this: CategoriesStore, wordId: number) {
    const categoriesList = Object.values(this);
    for (let i = 0; i < categoriesList.length; i++) {
      const cat = categoriesList[i];
      cat.words = cat.words.filter(w => w !== wordId);
    }
  },
};

const storeViews = {
  getIds(this: CategoriesStore): number[] {
    return Object.keys(this).map(Number);
  },

  getCategoriesByWordId(this: CategoriesStore, wordId: number): number[] {
    return Object.values(this).filter(cat => {
      return cat.words.find(w => w === wordId);
    }).map(cat => cat.categoryId);
  },

  getWordIdsByCategoryId(this: CategoriesStore, catId: number): number[] {
    return this[catId].words;
  },

  getWordsWithNullCategory(this: CategoriesStore, wordsIds: number[]): number[] {
    const idsInCategories = Object.values(this).reduce((carry, cat) => {
      carry.push(...cat.words);
      return carry;
    }, []);

    return wordsIds.filter(wordId => {
      return idsInCategories.indexOf(+wordId) === -1;
    });
  }
};

const store = createStore<CategoriesStore, typeof storeMethods, typeof storeViews>(
  {}, storeMethods, storeViews
);

export default store;
