import request from 'lib/request/request';

export const loadInitialState = (callback?) => {
  request({ api: 'getInitialData' }).then(response => {
    if (response) {
      console.log(response);

      // TODO: set DATA!!!
      callback && callback();
    }
  });
};
