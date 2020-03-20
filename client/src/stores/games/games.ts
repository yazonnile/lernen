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

type GameNames = 'rusDeu' | 'deuRus';

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
    rusDeu: {
      buttonText: 'RUS - DEU',
      categories: {
        selected: [],
        nullCategory: false
      }
    },
    deuRus: {
      buttonText: 'DEU - RUS',
      categories: {
        selected: [],
        nullCategory: false
      }
    }
  }, null, storeViews
);

export default store;
