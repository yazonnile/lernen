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

type GameNames = 'standard' | 'translationFirst' | 'articles' | 'plural' | 'spelling';

type GamesInterface = {
  [gameName in GameNames]: {
    buttonText: string;
    description: string;
    categories?: {
      selected: number[];
      nullCategory: boolean;
    }
  }
}

const store = createStore<GamesInterface, typeof storeViews>({
  standard: {
    buttonText: 'Стандартный',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    categories: {
      selected: [],
      nullCategory: false
    }
  },
  translationFirst: {
    buttonText: 'Сначала перевод',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    categories: {
      selected: [],
      nullCategory: false
    }
  },
  articles: {
    buttonText: 'Артикли',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
  },
  plural: {
    buttonText: 'Plural',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
  },
  spelling: {
    buttonText: 'Правописание',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    categories: {
      selected: [],
      nullCategory: false
    }
  }
}, null, storeViews);

export default store;
