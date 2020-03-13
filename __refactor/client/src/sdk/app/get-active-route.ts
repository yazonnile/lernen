const camelCaseToDashes = (string: string): string => {
  return string.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`);
};

/* global require */
// @ts-ignore
export default ({ componentId, routeId }) => require(`routes/${camelCaseToDashes(componentId)}/${camelCaseToDashes(routeId)}.svelte`).default;
