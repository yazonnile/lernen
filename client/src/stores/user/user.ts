import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';

interface UserStoreInterface {
  getId(): number|null;
}

const store = createStore<UserStoreInterface, User>(
  getInitialState().persistentData.user,
  null,
  ($user: User) => ({
    getId(): number|null {
      return $user.userId || null;
    }
  })
);

export default store;
