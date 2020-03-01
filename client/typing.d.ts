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
  validationRules: {
    [key: string]: object;
  };
  routes: {
    [componentId: string]: {
      [routeId: string]: Route;
    };
  };
};

type PageData = {
  activeRoute: {
    route: Route;
    params?: Params;
  } & RouteId;
  url?: string;
  [key: string]: any;
  categories?: {
    categoryId: number;
    categoryName: string;
  }[];
  setup: {
    voice: boolean;
    voiceSpeed: 1 | 2 | 3;
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
  },
  words: {
    [key: string]: {
      original: string,
      active: boolean;
    }
  }
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
  privateData?: {
    DEBUG?: true;
  };
  error?: [];
} & ResponseStore;

type PayloadSchemeType = 'login' | 'email' | 'password' | 'newPassword' | 'mcnulty' | 'loginOrEmail';

interface Params {
  userId?: number;
  postId?: number;
}

type RouteMethodsType = 'POST' | 'GET';

type RouteAccessType = 0 | 1 | 2;

interface RouteId {
  componentId: string;
  routeId?: string;
}

interface Route {
  methods?: RouteMethodsType[];
  access?: RouteAccessType[];
  payloadScheme?: PayloadSchemeType[];
  shouldUpdateRouter?: true;
  url: string;
  confirm?: true;
}

interface Payload {
  [key: string]: any;
  avatar?: string;
  logout?: true;
  tagId?: number;
  tagParentId?: number;
}
