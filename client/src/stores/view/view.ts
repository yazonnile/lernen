import createStore from 'lib/create-store/create-store';

export enum Views {
  home = 'home',
  categories = 'categories',
  dict = 'dict',
  setup = 'setup',
  editWord = 'editWord',
  addWord = 'addWord',
  sync = 'sync',
  preGame = 'preGame',

  standardGame = 'standardGame',
  translationFirstGame = 'translationFirstGame',
  articlesGame = 'articlesGame',
  pluralGame = 'pluralGame',
  spellingGame = 'spellingGame',
}

type PreGameParams = { gameId: string; }
type EditWordParams = { wordId: number; };
interface DefaultView { viewId: string; title: string; }
interface PreGameView extends DefaultView { params: PreGameParams; }
interface EditWordView extends DefaultView { params: EditWordParams; }
interface View extends DefaultView {
  params?: {
    wordId: number;
    gameId: string;
  };
}

const storeMethods = {
  home: (): View => ({ viewId: Views.home, title: 'lernen' }),
  categories: (): View => ({ viewId: Views.categories, title: 'категории' }),
  dict: (): View => ({ viewId: Views.dict, title: 'словарь' }),
  setup: (): View => ({ viewId: Views.setup, title: 'настройки' }),
  sync: (): View => ({ viewId: Views.sync, title: 'синхронизация' }),
  addWord: (): View => ({ viewId: Views.addWord, title: 'добавить слово' }),
  editWord: (params: EditWordParams): EditWordView => ({
    viewId: Views.editWord,
    title: 'редактировать слово',
    params
  }),
  preGame: (params: PreGameParams): PreGameView => ({
    viewId: Views.preGame,
    title: 'выберите категории',
    params
  }),
  standardGame: (): View => ({ viewId: Views.standardGame, title: 'стандартный' }),
  translationFirstGame: (): View => ({ viewId: Views.translationFirstGame, title: 'сначала перевод' }),
  articlesGame: (): View => ({ viewId: Views.articlesGame, title: 'артикли' }),
  pluralGame: (): View => ({ viewId: Views.pluralGame, title: 'plural' }),
  spellingGame: (): View => ({ viewId: Views.spellingGame, title: 'правописание' }),
};

const storeViews = {
  isSyncView(this: View) {
    return this.viewId === Views.sync;
  },
  getHomeViewId(): string {
    return Views.home;
  },
  isGameView(this: View): string {
    if (this.viewId === Views.preGame) {
      return this.params.gameId;
    } else {
      const games: string[] = [
        Views.standardGame,
        Views.translationFirstGame,
        Views.articlesGame,
        Views.pluralGame,
        Views.spellingGame,
      ];

      if (games.includes(this.viewId)) {
        return this.viewId.replace('Game', '');
      }
    }
  }
};

const store = createStore<View, typeof storeMethods, typeof storeViews>(
  storeMethods.home(),
  storeMethods,
  storeViews
);

store.subscribe(() => {
  window.scrollTo(0,0);
});

export default store;
