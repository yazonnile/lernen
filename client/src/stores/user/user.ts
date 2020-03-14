import { getInitialState } from 'api/get-initial-state/get-initial-state';
import createStore from 'lib/create-store/create-store';

const storeViews = {
  getSetup(this: User): User {
    return this;
  },

  getId(this: User): number {
    return this.userId;
  }
};

const store = createStore<User, {}, typeof storeViews>(
  getInitialState().user || null, null, storeViews
);

export default store;
