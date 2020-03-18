import { derived } from 'svelte/store';
import words from 'stores/words/words';
import categories from 'stores/categories/categories';
import user from 'stores/user/user';
import sync from 'stores/sync/sync';

const store = derived(
  [words, categories, user, sync],
  ([words, categories, user, sync]) => {
    return { words, categories, user, sync };
  }
);

export default store;
