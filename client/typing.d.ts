interface UseFunction<Params = { [key: string]: any }> {
  (node: HTMLElement, params?: Params): {
    destroy();
  };
}

type User = {} | {
  avatar: string | null;
  isAdmin: 1 | null;
  login: string;
  timezone: string | null;
  userId: number;
  regDate: number;
  lastVisitDate: number;
};

interface MessageOptions {
  status: string;
  text: string;
}

interface Message extends MessageOptions {
  id: string;
}

type InitialData = {
  validationRules: { [key: string]: object; };
  routes: {
    [componentId: string]: {
      [routeId: string]: Route;
    };
  };
  games: {
    [key: string]: {
      buttonText: string;
    };
  };
  categories: { [key: number]: Category };
  setup: Setup;
  words?: {
    [key: number]: Word;
  };
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

type PageData = {
  activeRoute: {
    route: Route;
    params?: Params;
  } & RouteId;
  url?: string;

  enabledIds?: number[];
  disabledIds?: number[];
  deletedIds?: number[];
  setupSaved?: boolean;
  newCategoriesIds?: number[];
  newWordId?: number;
};

type ClientDataType = {
  fromHistoryPop?: boolean;
};

type ResponseStore = {
  persistentData: {
    user: User;
    messages?: Message[];
  };
  pageData: PageData;
  clientData?: ClientDataType;
};

type ResponseData = {
  error?: [];
} & ResponseStore;

type PayloadSchemeType = 'login' | 'email' | 'password' | 'newPassword' | 'mcnulty' | 'loginOrEmail';

interface Params {
  userId?: number;
  wordId?: number;
  gameName?: 'learn' | 'second';
}

type RouteMethodsType = 'POST' | 'GET';

type RouteAccessType = 0 | 1 | 2;

interface RouteId {
  componentId: string;
  routeId?: string;
}

interface Route {
  method?: RouteMethodsType;
  access?: RouteAccessType[];
  payloadScheme?: PayloadSchemeType[];
  shouldUpdateRouter?: true;
  url: string;
  confirm?: true;
}

interface Payload {
  [key: string]: any;
  logout?: true;
}
