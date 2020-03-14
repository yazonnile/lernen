import { getInitialState } from 'api/get-initial-state/get-initial-state';
import createStore from 'lib/create-store/create-store';

interface UserStoreInterface {
  getSetup(): User;
  getId(): number;
}

const store = createStore<UserStoreInterface, User>(getInitialState().user || null, null, ($user: User) => ({
    getSetup(): User {
      return $user;
    },
    getId(): number {
      return $user.userId;
    }
  })
);

export default store;
