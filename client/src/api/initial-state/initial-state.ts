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
export const getInitialState = (key?: string): any => {
  return typeof key !== 'undefined' ? initialState[key] : initialState;
};
