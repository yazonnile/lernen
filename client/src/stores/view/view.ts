import createStore from 'lib/create-store/create-store';
import history from 'lib/history/history';
import { getInitialState } from 'api/initial-state/initial-state';

interface ViewStoreInterface {

}

const initialView = getInitialState().initialData.view;
history.replace(initialView.url, initialView);
const store = createStore<ViewStoreInterface, View>(initialView);
export default store;
