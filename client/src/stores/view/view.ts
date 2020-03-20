import createStore from 'lib/create-store/create-store';

export enum Views {
  home = 'home',
  auth = 'auth',
  categories = 'categories',
  dict = 'dict',
  preGame = 'preGame',
  rusDeu = 'rusDeu',
  deuRus = 'deuRus',
  setup = 'setup',
  stat = 'stat',
  editWord = 'editWord',
  addWord = 'addWord',
  sync = 'sync',
}

type PreGameParams = { gameId: string; }
type EditWordParams = { wordId: number; };
interface DefaultView { viewId: string; }
interface PreGameView extends DefaultView { params: PreGameParams; }
interface EditWordView extends DefaultView { params: EditWordParams; }
interface View extends DefaultView {
  params?: {
    wordId: number;
    gameId: string;
  };
}

const storeMethods = {
  home: (): View => ({ viewId: Views.home }),
  auth: (): View => ({ viewId: Views.auth }),
  categories: (): View => ({ viewId: Views.categories }),
  dict: (): View => ({ viewId: Views.dict }),
  rusDeu: (): View => ({ viewId: Views.rusDeu }),
  deuRus: (): View => ({ viewId: Views.deuRus }),
  setup: (): View => ({ viewId: Views.setup }),
  stat: (): View => ({ viewId: Views.stat }),
  sync: (): View => ({ viewId: Views.sync }),
  addWord: (): View => ({ viewId: Views.addWord }),
  editWord: (params: EditWordParams): EditWordView => ({
    viewId: Views.editWord,
    params
  }),
  preGame: (params: PreGameParams): PreGameView => ({
    viewId: Views.preGame,
    params
  }),
};

const storeViews = {
  isSyncView(this: View) {
    return this.viewId === Views.sync;
  }
};

const store = createStore<View, typeof storeMethods, typeof storeViews>(
  storeMethods.home(),
  storeMethods,
  storeViews
);

export default store;
