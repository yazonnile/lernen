import messagesStore from 'stores/messages/messages';

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
    url: string;
    payload: {
      [key: string]: any;
    };
  }): Promise<void | ResponseData>;
}

const request: Request = (options) => {
  if (busy) {
    return Promise.resolve(null);
  }

  busy = true;

  const { url, payload } = options;

  const body = new FormData;
  body.append('payload', JSON.stringify(payload));

  return fetch(url, {
    method: 'post',
    credentials: 'include',
    body
  }).then(status).then(json).then((responseData: ResponseData) => {
    busy = false;

    const { error, privateData, ...rest } = responseData;
    const { persistentData: { messages } } = rest;

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
