import { derived } from 'svelte/store';
import words from 'stores/words/words';
import categories from 'stores/categories/categories';
import user from 'stores/user/user';
import sync from 'stores/sync/sync';
import view from 'stores/view/view';
import games from 'stores/games/games';

const store = derived(
  [words, categories, user, sync, view, games],
  ([words, categories, user, sync, view, games]) => {

    const gamesCategories = Object.keys(games).reduce((carry, gameId) => {
      carry[gameId] = games[gameId].categories;
      return carry;
    }, {});

    return { words, categories, user, sync, view, gamesCategories };
  }
);

export default store;
