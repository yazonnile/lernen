import { quintOut } from 'svelte/easing';

const baseAnimation = {
  duration: 500,
  opacity: 0,
  easing: quintOut
};

export const topAnimation = { ...baseAnimation, y: -30 };
export const bottomAnimation = { ...baseAnimation, y: 30 };

export const explodeAnimation = { ...baseAnimation, start: 0.5 };
export const implodeAnimation = { ...baseAnimation, start: 0.5, delay: 510 };

export { fly, scale } from 'svelte/transition';

