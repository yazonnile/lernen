interface UseFunction<Params = { [key: string]: any }> {
  (node: HTMLElement, params?: Params): {
    destroy();
  };
}

type User = {
  login?: string;
  userId?: number;
} & Setup;

interface MessageOptions {
  status: string;
  text: string;
  persistent?: boolean;
}

interface Message extends MessageOptions {
  id: string;
}

type InitialData = {
  validationRules?: { [key: string]: object; };
};

type Category = {
  categoryId?: number;
  categoryName: string;
};

type WordType = 'noun' | 'verb' | 'phrase' | 'other';
type WordArticles = 'der' | 'die' | 'das';

type Word = {
  wordId: number;
  original: string;
  active: boolean;
  translation: string;
  type: WordType;
  userId: number;
  article?: WordArticles;
  plural?: string;
  strong1?: string;
  strong2?: string;
  strong3?: string;
  strong4?: string;
  strong5?: string;
  strong6?: string;
  irregular1?: string;
  irregular2?: string;
  categories?: number[];
};

type Setup = {
  voice?: boolean;
  voiceSpeed?: number;
  phrases?: boolean;
  soundPhrases?: boolean;
  nouns?: boolean;
  soundNouns?: boolean;
  articles?: boolean;
  soundArticles?: boolean;
  plural?: boolean;
  soundPlural?: boolean;
  verbs?: boolean;
  soundVerbs?: boolean;
  strongVerbs?: boolean;
  soundStrongVerbs?: boolean;
  irregularVerbs?: boolean;
  soundIrregularVerbs?: boolean;
  other?: boolean;
};

type ResponseData = {
  error?: [];
  offline?: Message;
  messages?: Message[];
  user: User;
  initialData?: InitialData;
  words: {
    [key: number]: Word
  };
  categories: {
    [key: number]: Category;
  };
  syncResult: {
    categoriesMap: {
      [key: number]: number;
    };
    wordsMap: {
      [key: number]: number;
    };
    notValidNewCategories: number[];
    notValidUpdatedCategories: number[];
    notValidNewWords: number[];
    notValidUpdatedWords: number[];
  }
};

type PayloadSchemeType = 'login' | 'password' | 'newPassword' | 'mcnulty';
