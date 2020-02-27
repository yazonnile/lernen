import createStore from 'lib/create-store/create-store';

enum Views {
  home = 'home',
  add = 'add',
  login = 'login',
  learn = 'learn',
  setup = 'setup',
  words = 'words',
}

interface ViewStoreInterface {
  home();
  add();
  login();
  learn();
  setup();
  words();
}

const initialView = window.__initialState && window.__initialState.data ? Views.home : Views.login;

export default createStore<ViewStoreInterface, string>(initialView, $store => ({
  home: () => Views.home,
  add: () => Views.add,
  login: () => Views.login,
  learn: () => Views.learn,
  setup: () => Views.setup,
  words: () => Views.words,
}));
