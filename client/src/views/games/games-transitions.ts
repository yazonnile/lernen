import { quintOut } from 'svelte/easing';

const baseAnimation = {
  duration: 500,
  opacity: 0,
  easing: quintOut
};

export const topAnimation = { ...baseAnimation, y: -30 };
export const bottomAnimation = { ...baseAnimation, y: 30 };
export { fly } from 'svelte/transition';

