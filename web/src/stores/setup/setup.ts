import { writable, Writable } from 'svelte/store';

interface SetupValue {
  phrases: boolean;
  soundPhrases: boolean;
  words: boolean;
  soundWords: boolean;
  nouns: boolean;
  articles: boolean;
  soundArticles: boolean;
  plural: boolean;
  soundPlural: boolean;
  verbs: boolean;
  strongVerbs: boolean;
  soundStrongVerbs: boolean;
  irregularVerbs: boolean;
  soundIrregularVerbs: boolean;
  others: boolean;
  soundOther: boolean;
}

const initialSetup = window.__initialState && window.__initialState.setup;

const store: Writable<SetupValue> & SetupValue = writable(initialSetup) as any;

export default store;
