import createStore from 'lib/create-store/create-store';

const storeViews = {
  getGamesCategories(this: GamesInterface, gameName: string): {
    categoriesIds: number[];
    nullCategory: boolean;
  } {
    const cats = this[gameName].categories.selected || [];
    return {
      categoriesIds: cats,
      nullCategory: this[gameName].categories.nullCategory || !cats.length
    };
  }
};

type GameNames = 'learn';

type GamesInterface = {
  [gameName in GameNames]: {
    buttonText: string;
    categories: {
      selected: number[];
      nullCategory: boolean;
    }
  }
}

const store = createStore<GamesInterface, typeof storeViews>({
    learn: {
      buttonText: 'учить',
      categories: []
    }
  }, null, storeViews
);

export default store;
