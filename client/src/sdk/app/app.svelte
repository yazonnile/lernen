<script>
  import 'api/initial-state/initial-state';
  import ScrollToggle from 'sdk/scroll-toggle/scroll-toggle.svelte';
  import Messages from 'sdk/messages/messages.svelte';
  import Header from 'sdk/header/header.svelte';
  import getActiveRoute from './get-active-route';
  import { page } from 'stores';

  $: activeRoute = getActiveRoute($page.activeRoute);
</script>

<div class="app">
  <Header />

  <div id="bottom-buttons"></div>
  <main class="main">
    <svelte:component this={activeRoute} />
  </main>

  <ScrollToggle />
  <Messages />

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

  .main > :global(*) {
    flex: 1;
    width: 100%;
  }

  #bottom-buttons {
    order: 2;
    padding: 10px;
  }

  #bottom-buttons:empty {
    padding: 0;
  }
</style>
