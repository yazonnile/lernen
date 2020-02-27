<script>
  import Header from 'sdk/header/header.svelte';
  import { view } from 'stores';

  /* global require */
  $: activeView = require(`views/${$view}/${$view}.svelte`).default;
</script>

<div class="app">
  <Header />

  <main class="main">
    <svelte:component this={activeView} />
  </main>
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
  }
</style>

