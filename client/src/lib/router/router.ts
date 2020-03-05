import { getInitialState } from 'api/initial-state/initial-state';
import responseDataStore from 'stores/response-data/response-data';
import history from 'lib/history/history';
import request from 'lib/request/request';

const getRoute = ({ componentId, routeId }: RouteId): Route => {
  const { routes } = getInitialState().initialData;
  return routes[componentId] && routes[componentId][routeId];
};

const getUrl = (url: string, params: Params = {}): string => {
  return url.replace(/\[.*?:(\w+)]/g, (...match) => {
    const paramId = match[1];
    return params[paramId] || paramId;
  });
};

const processCallback = (cb, data = null) => {
  if (typeof cb === 'function') {
    cb(data);
  }
};

interface UseRoute {
  (
    options: {
      payload?: Payload;
      params?: Params;
      clientData?: ClientDataType;
    } & RouteId,
    cb?: (data?: PageData) => any
  );
}

export const useRoute: UseRoute = ({
  componentId,
  routeId = componentId,
  payload = {},
  params = {},
  clientData = {}
}, cb = null): void => {
  const route = getRoute({ componentId, routeId });
  if (!route) {
    return console.error('can\'t find route missing');
  }

  if (route.confirm && !confirm('Вы уверены?')) {
    return;
  }

  const url = getUrl(route.url, params);
  const { method = 'GET' } = route;

  if (method === 'GET' && !payload.logout) {
    // no request here
    responseDataStore.update(value => {
      return {
        ...value,
        pageData: {
          ...value.pageData,
          activeRoute: { componentId, routeId, params, route },
          url,
        },
        clientData,
      };
    });

    return processCallback(cb);
  }

  // send request and switch router
  request({ url, payload }).then(responseData => {
    if (responseData) {
      responseDataStore.set({
        ...responseData,
        clientData
      });
      processCallback(cb, responseData.pageData);
    }
  });
};

// sync history with router
history.listen((location, action) => {
  if (action === 'POP') {
    useRoute({
      ...location.state,
      clientData: { fromHistoryPop: true }
    });
  }
});

export const getRouteValidationScheme = ({ componentId, routeId }: RouteId): PayloadSchemeType[]  => {
  const route = getRoute({ componentId, routeId: routeId || componentId });
  return route.payloadScheme;
};
