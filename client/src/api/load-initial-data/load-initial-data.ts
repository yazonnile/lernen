import request from 'lib/request/request';
import { words, categories } from 'stores';

export const loadInitialData = (callback?) => {
  request({ api: 'getInitialData' }).then(response => {
    if (response) {
      console.log('initialData => ', response);
      words.set(response.words);
      categories.set(response.categories);
      callback && callback();
    }
  });
};
