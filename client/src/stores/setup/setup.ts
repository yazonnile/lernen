import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';

interface GamesStoreInterface {
  getSetup(): Setup;
}

const store = createStore<GamesStoreInterface, Setup>(
  getInitialState().initialData.setup,
  null,
  ($setup: Setup) => ({
    getSetup() {
      return $setup;
    }
  })
);

export default store;
