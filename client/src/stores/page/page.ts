import { writable, Writable } from 'svelte/store';
import { getInitialState } from 'api/initial-state/initial-state';
import responseDataStore from 'stores/response-data/response-data';
import history from 'lib/history/history';

const store: PageData & Writable<PageData> = writable(getInitialState().pageData) as any;

let initial = true;
responseDataStore.subscribe(({ pageData, clientData }) => {
  const { activeRoute, url } = pageData;

  // update router just in case on new page route
  if (activeRoute.route.shouldUpdateRouter) {
    store.set(pageData);

    if (initial) {
      initial = false;
      history.replace(url, activeRoute);
    } else if (!clientData.fromHistoryPop) {
      history.push(url, activeRoute);
    }
  }
});

export default store;
