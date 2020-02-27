<script>
  import Header from 'sdk/header/header.svelte';
  import { view } from 'stores';

  /* global require */
  $: activeView = require(`views/${$view}/${$view}.svelte`).default;
</script>

<Header />

<main class="main">
  <svelte:component this={activeView} />
</main>

<style>
  .main {
    padding: 10px;
  }
</style>

