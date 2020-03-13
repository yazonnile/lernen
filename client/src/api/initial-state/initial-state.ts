let initialState;
try {
  initialState = JSON.parse(atob(window.__initialState));
} catch (e) {
  initialState = {}
}

// remove global variable
delete window.__initialState;

// remove script node
const scriptNode = document.getElementById('initial-state');
scriptNode && scriptNode.parentNode.removeChild(scriptNode);

console.log('initialState => ', initialState);

interface InitialStateInterface {
  persistentData: {
    messages: Message[];
    user: User;
  };
  pageData: PageData;
  initialData: InitialData;
  error?: object;
}

export const getInitialState = (): InitialStateInterface => {
  return initialState;
};
