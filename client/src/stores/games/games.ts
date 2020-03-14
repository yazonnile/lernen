import createStore from 'lib/create-store/create-store';

interface GamesInterface {
  [key: string]: {
    buttonText: string;
    categories: {
      selected: number[];
      nullCategory: boolean;
    }
  }
}

interface GamesStoreInterface {
  getGamesCategories(gameName): {
    categoriesIds: number[];
    nullCategory: boolean;
  };
}

const store = createStore<GamesStoreInterface, GamesInterface>({
    learn: {
      buttonText: 'учить',
      categories: []
    }
  }, null, ($games: GamesInterface) => ({
    getGamesCategories(gameName) {
      const cats = $games[gameName].categories.selected || [];
      return {
        categoriesIds: cats,
        nullCategory: $games[gameName].categories.nullCategory || !cats.length
      };
    }
  })
);

export default store;
