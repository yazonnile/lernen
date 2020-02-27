import createStore from 'lib/create-store/create-store';

enum Views {
  home = 'home',
  add = 'add',
  login = 'login',
}

interface ViewStoreInterface {
  home();
  add();
  login();
}

const initialView = window.__initialState && window.__initialState.data ? Views.add : Views.login;

export default createStore<ViewStoreInterface, string>(initialView, $store => ({
  home: () => Views.home,
  add: () => Views.add,
  login: () => Views.login,
}));
