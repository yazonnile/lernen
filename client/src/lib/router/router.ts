import { getInitialState } from 'api/initial-state/initial-state';
import { user, view } from 'stores';
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
    } & RouteId,
    cb?: (data?: PageData) => any
  );
}

export const useRoute: UseRoute = ({
  componentId,
  routeId = componentId,
  payload = {},
  params = {},
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

  if (method === 'GET') {
    if (!user.getId() && componentId !== 'auth') {
      return;
    }

    // no request here
    const newView = { url, componentId, routeId, params, route };
    view.set(newView);
    return processCallback(cb);
  }

  // send request
  request({ url, payload }).then(responseData => {
    if (responseData) {
      processCallback(cb, responseData.pageData);
    }
  });
};

export const getRouteValidationScheme = ({ componentId, routeId }: RouteId): PayloadSchemeType[]  => {
  const route = getRoute({ componentId, routeId: routeId || componentId });
  return route.payloadScheme;
};
