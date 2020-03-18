import syncManager from 'api/sync-manager/sync-manager';
import { getInitialState } from 'api/get-initial-state/get-initial-state';
import createStore from 'lib/create-store/create-store';

const storeMethods = {
  saveSetup(newSetup: User) {
    syncManager.syncSetup();
    return newSetup;
  }
};

const storeViews = {
  getSetup(this: User): User {
    return this;
  },

  getId(this: User): number {
    return this.userId;
  }
};

const store = createStore<User, typeof storeMethods, typeof storeViews>(
  getInitialState().user || null, null, storeViews
);

export default store;
