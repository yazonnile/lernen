<script>
  export let className = '';

  import { fly } from 'svelte/transition';
</script>

<div
  in:fly|local="{{ duration: 250, x: 100, opacity: 0 }}"
  class={className}
>
  <slot />
</div>
