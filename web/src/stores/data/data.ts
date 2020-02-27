import createStore from 'lib/create-store/create-store';

type DefaultType = {
  type: 'word' | 'phrase';
  text: string;
  translation: string;
};

type PhraseType = { } & DefaultType;

type WordType = {
  wordType: 'noun' | 'verb' | 'other';
} & DefaultType;

type NounWordType = {
  article: 'der' | 'die' | 'das';
  plural: string;
} & WordType;

type VerbWordType = {
  strongVerb: boolean;
  strongVerbVariations: [string, string, string, string, string, string];
} & WordType;

type OtherWordType = { } & WordType;

type DataType = PhraseType | NounWordType | VerbWordType | OtherWordType;

interface DataValue {
  [key: string]: DataType;
}

interface DataStore {
  add(key: string, data: DataType);
  remove(key: string);
}

const initialWords = window.__initialState && window.__initialState.data;

const store = createStore<DataStore, DataValue>(initialWords, $words => ({
  add(key: string, data: DataType) {
    $words[key] = data;
  },

  remove(key: string) {
    delete $words[key];
  }
}));

export default store;
