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

  standard = 'standard',
  translationFirst = 'translationFirst',
  articles = 'articles',
  plural = 'plural',
  spelling = 'spelling',
}

type PreGameParams = { gameId: string };
type EditWordParams = { wordId: number };

interface DefaultView {
  viewId: string;
  title: string;
}

interface PreGameView extends DefaultView {
  params: PreGameParams;
}

interface EditWordView extends DefaultView {
  params: EditWordParams;
}

interface View extends DefaultView {
  params?: {
    wordId: number;
    gameId: string;
  };
}

const storeMethods = {
  home: (): View => ({viewId: Views.home, title: 'lernen'}),
  categories: (): View => ({viewId: Views.categories, title: 'категории'}),
  dict: (): View => ({viewId: Views.dict, title: 'словарь'}),
  setup: (): View => ({viewId: Views.setup, title: 'настройки'}),
  sync: (): View => ({viewId: Views.sync, title: 'синхронизация'}),
  addWord: (): View => ({viewId: Views.addWord, title: 'добавить слово'}),
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
  standard: (): View => ({viewId: Views.standard, title: 'стандартный'}),
  translationFirst: (): View => ({viewId: Views.translationFirst, title: 'сначала перевод'}),
  articles: (): View => ({viewId: Views.articles, title: 'артикли'}),
  plural: (): View => ({viewId: Views.plural, title: 'plural'}),
  spelling: (): View => ({viewId: Views.spelling, title: 'правописание'}),
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
        Views.standard,
        Views.translationFirst,
        Views.articles,
        Views.plural,
        Views.spelling,
      ];

      if (games.includes(this.viewId)) {
        return this.viewId;
      }
    }
  },
  isNounGameView(this: View): boolean {
    const games: string[] = [
      Views.articles,
      Views.plural,
    ];

    return games.includes(this.viewId);
  }
};

const store = createStore<View, typeof storeMethods, typeof storeViews>(
  storeMethods.home(),
  storeMethods,
  storeViews
);

store.subscribe(() => {
  window.scrollTo(0, 0);
});

export default store;
