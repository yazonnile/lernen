import { messages as messagesStore } from 'stores';

const status = response => new Promise((resolve, reject) => {
  if (response.status >= 200 && response.status < 300) {
    resolve(response);
  } else {
    reject(new Error(response.statusText));
  }
});

const json = response => response.json();

let busy = false;

interface Request {
  (options: {
    api: string;
    payload?: {
      [key: string]: any;
    };
  }): Promise<void | ResponseData>;
}

const request: Request = (options) => {
  if (busy) {
    return Promise.resolve(null);
  }

  busy = true;

  const { api, payload = {} } = options;

  const body = new FormData;
  body.append('payload', JSON.stringify(payload));
  body.append('api', JSON.stringify(api));

  return fetch('/api', {
    method: 'post',
    credentials: 'include',
    body
  }).then(status).then(json).then((responseData: ResponseData) => {
    busy = false;

    const { error, offline, ...rest } = responseData;

    if (offline) {
      messagesStore.addMessage(offline);
      return null;
    }

    const { messages } = rest;

    if (Array.isArray(messages)) {
      messagesStore.addMessages(messages);
    }

    if (error) {
      return null;
    } else {
      return rest;
    }
  }).catch((e) => {
    console.error('unhandled in promise', e);
    busy = false;
  });
};

export default request;
