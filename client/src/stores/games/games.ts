import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';

interface GamesInterface {
  [key: string]: {
    buttonText: string;
    categories: {
      selected: number[];
      nullCategory: boolean;
    }
  }
}

interface GamesStoreInterface {

}

const store = createStore<GamesStoreInterface, GamesInterface>(
  getInitialState().initialData.games
);

export default store;
