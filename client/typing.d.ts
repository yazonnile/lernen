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
  }[]
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
