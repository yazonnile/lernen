import history from 'lib/history/history';
import createStore from 'lib/create-store/create-store';

interface RouteParams {
  [key: string]: string | number;
}

interface RouterStore {
  url: string;
  params: RouteParams;
}

interface RouterStoreInterface {
  push(url: string, params?: RouteParams);
  replace(url: string, params?: RouteParams);
}

const initialRouter: RouterStore = {
  url: '/',
  params: {}
};

const store = createStore<RouterStoreInterface, RouterStore>(initialRouter, $store => ({
  push(url: string, params: RouteParams = {}) {
    history.push(url, params);
    return { url, params };
  },

  replace(url: string, params: RouteParams = {}) {
    history.replace(url, params);
    return { url, params };
  }
}));

// sync history with router
history.listen((location, action) => {
  if (action === 'POP') {
    store.set({
      url: location.pathname,
      params: location.state
    });
  }
});

history.replace(initialRouter.url, initialRouter.params);

export default store;
