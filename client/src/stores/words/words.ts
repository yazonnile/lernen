import createStore from 'lib/create-store/create-store';
import { getInitialState } from 'api/initial-state/initial-state';

interface WordsStoreInterface {
  deleteWords(ids: number[]);
  disableWords(ids: number[]);
  enableWords(ids: number[]);

  getWordsArray(): Word[];
}

const store = createStore<WordsStoreInterface, { [key: number]: Word }>(
  getInitialState().initialData.words,
  $words => ({
    deleteWords(ids: number[]) {
      for (let i = 0; i < ids.length; i++) {
        delete $words[ids[i]];
      }
    },
    disableWords(ids: number[]) {
      for (let i = 0; i < ids.length; i++) {
        $words[ids[i]].active = false;
      }
    },
    enableWords(ids: number[]) {
      for (let i = 0; i < ids.length; i++) {
        $words[ids[i]].active = true;
      }
    }
  }),$words => ({
    getWordsArray(): Word[] {
      return Object.values($words);
    }
  })
);

export default store;
