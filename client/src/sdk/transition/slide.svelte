<script>
  export let active;

  import { slide } from 'svelte/transition'
</script>

{#if active}
  <div transition:slide|local>
    <slot />
  </div>
{/if}

<style>
  div {
    overflow: hidden;
  }
</style>
