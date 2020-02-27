const status = response => new Promise((resolve, reject) => {
  if (response.status >= 200 && response.status < 300) {
    resolve(response);
  } else {
    reject(new Error(response.statusText));
  }
});

const json = response => response.json();

interface Request {
  (
    url: string,
    payload: {
      [key: string]: any;
    }
  ): Promise<any>;
}

const request: Request = (url, payload) => {
  const body = new FormData;
  body.append('payload', JSON.stringify(payload));

  return fetch(url, {
    method: 'post',
    credentials: 'include',
    body
  }).then(status).then(json).then((responseData) => {
    const { error, ...rest } = responseData;

    if (error) {
      alert('ERROR');
      return null;
    } else {
      return rest;
    }
  }).catch((e) => {
    console.error('unhandled in promise', e);
  });
};

export default request;
