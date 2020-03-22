import createStore from 'lib/create-store/create-store';

export enum Views {
  home = 'home',
  categories = 'categories',
  dict = 'dict',
  preGame = 'preGame',
  rusDeu = 'rusDeu',
  deuRus = 'deuRus',
  setup = 'setup',
  editWord = 'editWord',
  addWord = 'addWord',
  sync = 'sync',
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
  rusDeu: (): View => ({ viewId: Views.rusDeu, title: 'игра №2' }),
  deuRus: (): View => ({ viewId: Views.deuRus, title: 'игра №1' }),
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
};

const storeViews = {
  isSyncView(this: View) {
    return this.viewId === Views.sync;
  },
  isHomeView(this: View) {
    return this.viewId === Views.home;
  },
};

const store = createStore<View, typeof storeMethods, typeof storeViews>(
  storeMethods.home(),
  storeMethods,
  storeViews
);

export default store;
