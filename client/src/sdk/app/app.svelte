<script>
  import Header from 'sdk/header/header.svelte';
  import { user } from 'stores';
</script>

<div class="app">
  {#if $user}
    <Header />
  {/if}

  <div class="main">
    {#if $user}
      ANY USER VIEW
    {:else}
      AUTH VIEW
    {/if}
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .main {
    display: flex;
    flex: 1;
    padding: 10px;
    order: 1;
  }
</style>
