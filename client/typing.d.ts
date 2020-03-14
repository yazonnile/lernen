interface UseFunction<Params = { [key: string]: any }> {
  (node: HTMLElement, params?: Params): {
    destroy();
  };
}

type User = {
  login?: string;
  userId?: number;
};

interface MessageOptions {
  status: string;
  text: string;
}

interface Message extends MessageOptions {
  id: string;
}

type InitialData = {
  validationRules?: { [key: string]: object; };
  user?: User | null;
};

type Category = {
  categoryId: number;
  categoryName: string;
  words: number[];
};

type WordType = 'noun' | 'verb' | 'phrase' | 'other';
type WordArticles = 'der' | 'die' | 'das';
type SetupVoiceSpeed = 1 | 2 | 3;

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
};

type Setup = {
  voice: boolean;
  voiceSpeed: SetupVoiceSpeed;
  phrases: boolean;
  soundPhrases: boolean;
  nouns: boolean;
  soundNouns: boolean;
  articles: boolean;
  soundArticles: boolean;
  plural: boolean;
  soundPlural: boolean;
  verbs: boolean;
  soundVerbs: boolean;
  strongVerbs: boolean;
  soundStrongVerbs: boolean;
  irregularVerbs: boolean;
  soundIrregularVerbs: boolean;
  other: boolean;
};

// type ResponseStore = {
  // enabledIds?: number[];
  // disabledIds?: number[];
  // deletedIds?: number[];
  // newCategories?: Category[];
  // newAndLinkedCategories?: number[];
  // newWordId?: number;
// };

type ResponseData = {
  error?: [];
  offline?: Message;
  messages?: Message[];
  user: User;
  initialData?: InitialData;
};

type PayloadSchemeType = 'login' | 'password' | 'newPassword' | 'mcnulty';
