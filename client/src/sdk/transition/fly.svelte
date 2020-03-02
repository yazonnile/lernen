<script>
  export let active;
  export let params = { x: -50, opacity: 0 };

  import { fly } from 'svelte/transition'
</script>

{#if active}
  <div in:fly|local={params}>
    <slot />
  </div>
{/if}
