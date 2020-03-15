import createStore from 'lib/create-store/create-store';

interface CategoriesStore {
  [key: number]: Category;
}

const storeMethods = {
  createCategory(this: CategoriesStore, category: Category) {
    this[category.categoryId] = category;
  },
};

const storeViews = {
  getIds(this: CategoriesStore): number[] {
    return Object.keys(this).map(Number);
  },
};

const store = createStore<CategoriesStore, typeof storeMethods, typeof storeViews>(
  {}, storeMethods, storeViews
);

export default store;
