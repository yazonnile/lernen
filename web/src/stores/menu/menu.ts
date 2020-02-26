import createStore from 'lib/create-store/create-store';

enum MobileMenuTypes {
  left = 'left',
  right = 'right',
}

interface MobileMenuStoreInterface {
  hide();
  showRight();
  showLeft();
  [MobileMenuTypes.right]?: true;
  [MobileMenuTypes.left]?: true;
}

type MobileMenuStoreValue = {
  [key in MobileMenuTypes]?: true
}

const store = createStore<MobileMenuStoreInterface, MobileMenuStoreValue>({}, () => ({
  hide: () => {
    return {};
  },

  showRight: () => {
    return {
      [MobileMenuTypes.right]: true
    };
  },

  showLeft: () => {
    return {
      [MobileMenuTypes.left]: true
    };
  },
}));

store.subscribe(value => {
  document.body.style.overflow = Object.keys(value).length ? 'hidden' : '';
});

export default store;
