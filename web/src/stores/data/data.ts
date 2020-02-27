import createStore from 'lib/create-store/create-store';

type DefaultType = {
  type: 'word' | 'phrase';
  text: string;
  translation: string;
  active: boolean;
};

type PhraseType = { } & DefaultType;

type WordType = {
  wordType: 'noun' | 'verb' | 'other';
} & DefaultType;

type NounWordType = {
  article: 'der' | 'die' | 'das';
  plural: string;
  pluralOnly: boolean;
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
  on(keys: string[]);
  off(keys: string[]);
}

const initialWords = window.__initialState && window.__initialState.data;

const store = createStore<DataStore, DataValue>(initialWords, $words => ({
  add(key: string, data: DataType) {
    $words[key] = data;
  },

  on(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      const word = $words[keys[i]];
      if (word) {
        word.active = true;
      }
    }
  },

  off(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      const word = $words[keys[i]];
      if (word) {
        word.active = false;
      }
    }
  }
}));

export default store;
