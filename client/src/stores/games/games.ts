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
    };
  };
};

const store = createStore<GamesInterface, typeof storeViews>({
  standard: {
    buttonText: 'Стандартный',
    description: 'Учим, произносим. Слова, артикли, plural, неправильные глаголы и пр. Я же говорю - всё',
    categories: {
      selected: [],
      nullCategory: false
    }
  },
  translationFirst: {
    buttonText: 'Сначала перевод',
    description: 'А если сначала немецкий? На русский сможете?',
    categories: {
      selected: [],
      nullCategory: false
    }
  },
  articles: {
    buttonText: 'Артикли',
    description: 'Выбрать один из трёх, что может быть проще? А отделить мужчину от женщины?',
    categories: {
      selected: [],
      nullCategory: false
    }
  },
  plural: {
    buttonText: 'Plural',
    description: 'Сложно, конечно. Но потом окажется, что plural форм не так и много',
    categories: {
      selected: [],
      nullCategory: false
    }
  },
  spelling: {
    buttonText: 'Buchstabieren',
    description: 'Können Sie das wiederholen, bitte? А по буквам, bitte?',
    categories: {
      selected: [],
      nullCategory: false
    }
  }
}, null, storeViews);

export default store;
