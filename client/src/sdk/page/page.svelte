<script>
  export let className = '';
  export let homePage = false;

  import { fly } from 'svelte/transition';
</script>

<div
  in:fly|local="{{ duration: 250, x: 100 * (homePage ? -1 : 1), opacity: 0 }}"
  class={className}
>
  <slot />
</div>
