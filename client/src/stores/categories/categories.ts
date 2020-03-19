import createStore from 'lib/create-store/create-store';
import syncManager from 'api/sync-manager/sync-manager';

interface CategoriesStore {
  [key: number]: Category;
}

const storeMethods = {
  updateCategory(this: CategoriesStore, category: Category) {
    const categoryId = syncManager.syncCategory(category.categoryId);
    this[categoryId] = { ...category, categoryId };
  },

  updateCategoriesIds(this: CategoriesStore, categoriesMap: { [key: number]: number }) {
    const oldIds = Object.keys(categoriesMap);
    for (let i = 0; i < oldIds.length; i++) {
      const oldId = oldIds[i];
      const newId = categoriesMap[oldId];
      this[newId] = { ...this[oldId], categoryId: newId };
      delete this[oldId];
    }
  }
};

const storeViews = {
  getIds(this: CategoriesStore): number[] {
    return Object.keys(this).map(Number);
  },

  getCategoryIdByName(this: CategoriesStore, categoryName: string): number {
    const category = Object.values(this).find(c => c.categoryName === categoryName);
    return category ? category.categoryId : null;
  },

  getCategoryById(this: CategoriesStore, categoryId: number): Category {
    return this[categoryId];
  }
};

const store = createStore<CategoriesStore, typeof storeMethods, typeof storeViews>(
  {}, storeMethods, storeViews
);

export default store;
