import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';

interface CategoriesStoreInterface {
  getIds(): number[];
}

const store = createStore<CategoriesStoreInterface, { [key: number]: Category }>(
  getInitialState().initialData.categories,
  $categories => ({

  }),
  $categories => ({
    getIds(): number[] {
      return $categories.map(c => c.categoryId);
    }
  })
);

export default store;
