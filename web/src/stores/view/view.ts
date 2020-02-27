import createStore from 'lib/create-store/create-store';

enum Views {
  home = 'home',
  add = 'add',
  login = 'login',
  learn = 'learn',
}

interface ViewStoreInterface {
  home();
  add();
  login();
  learn();
}

const initialView = window.__initialState && window.__initialState.data ? Views.learn : Views.login;

export default createStore<ViewStoreInterface, string>(initialView, $store => ({
  home: () => Views.home,
  add: () => Views.add,
  login: () => Views.login,
  learn: () => Views.learn,
}));
