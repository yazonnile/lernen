import { derived } from 'svelte/store';
import words from 'stores/words/words';
import categories from 'stores/categories/categories';
import user from 'stores/user/user';
import sync from 'stores/sync/sync';
import view from 'stores/view/view';

const store = derived(
  [words, categories, user, sync, view],
  ([words, categories, user, sync, view]) => {
    return { words, categories, user, sync, view };
  }
);

export default store;
