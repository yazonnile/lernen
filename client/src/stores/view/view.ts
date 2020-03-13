import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';

interface ViewStoreInterface {

}

const initialView = getInitialState().initialData.view;
const store = createStore<ViewStoreInterface, View>(initialView);
export default store;
