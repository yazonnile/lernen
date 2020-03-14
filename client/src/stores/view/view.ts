import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/get-initial-state/get-initial-state';

export enum Views {
  home,
  auth,
  categories,
  dict,
  preGame,
  learn,
  setup,
  stat,
  editWord,
  addWord,
}

type PreGameParams = { gameId: string; }
type EditWordParams = { wordId: number; };
interface DefaultView { viewId: number; }
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
  learn: (): View => ({ viewId: Views.learn }),
  setup: (): View => ({ viewId: Views.setup }),
  stat: (): View => ({ viewId: Views.stat }),
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

const store = createStore<View, typeof storeMethods>(
  getInitialState().user ? storeMethods.home() : storeMethods.auth(),
  storeMethods
);

export default store;
