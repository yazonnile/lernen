import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/get-initial-state/get-initial-state';

type DefaultView = {
  viewId: string;
};

type PreGameParams = {
  gameId: string;
}

type PreGameView = DefaultView & {
  params: PreGameParams;
};

type EditWordParams = {
  wordId: number;
};

type EditWordView = DefaultView & {
  params: EditWordParams;
};

const views = {
  home: { viewId: 'home' },
  auth: { viewId: 'auth' },
  categories: { viewId: 'auth' },
  dict: { viewId: 'dict' },
  preGame: { viewId: 'preGame' },
  learn: { viewId: 'learn' },
  setup: { viewId: 'setup' },
  stat: { viewId: 'stat' },
  editWord: { viewId: 'editWord' },
  addWord: { viewId: 'addWord' },
};

interface ViewStoreInterface {
  home(): View;
  auth(): View;
  categories(): View;
  dict(): View;
  preGame(params: PreGameParams): PreGameView;
  learn(): View;
  setup(): View;
  stat(): View;
  editWord(params: EditWordParams): EditWordView;
  addWord(): View;
}

interface ViewParams {
  wordId: number;
  gameId: string;
};

interface View {
  viewId: string;
  params?: ViewParams;
}

const store = createStore<ViewStoreInterface, View>(
  getInitialState().user ? views.home : views.auth,
  () => ({
    home: () => views.home,
    auth: () => views.auth,
    categories: () => views.categories,
    dict: () => views.dict,
    preGame: (params: PreGameParams) => {
      return {
        ...views.preGame,
        params
      };
    },
    learn: () => views.learn,
    setup: () => views.setup,
    stat: () => views.stat,
    editWord: (params: EditWordParams) => {
      return {
        ...views.editWord,
        params
      };
    },
    addWord: () => views.addWord,
  })
);

export default store;
