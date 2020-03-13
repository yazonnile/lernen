<script>
  import 'api/initial-state/initial-state';
  import ScrollToggle from 'sdk/scroll-toggle/scroll-toggle.svelte';
  import Messages from 'sdk/messages/messages.svelte';
  import Header from 'sdk/header/header.svelte';

  import Auth from 'routes/auth/auth.svelte';
  import Categories from 'routes/categories/categories.svelte';
  import Dict from 'routes/dict/dict.svelte';
  import PreGame from 'routes/games/pre-game.svelte';
  import Learn from 'routes/games/learn.svelte';
  import Home from 'routes/home/home.svelte';
  import Setup from 'routes/setup/setup.svelte';
  import Stat from 'routes/stat/stat.svelte';
  import AddWord from 'routes/words/add-word.svelte';
  import EditWord from 'routes/words/edit-word.svelte';

  import { view, user } from 'stores';
</script>

<div class="app">
  <Header />

  <div id="bottom-buttons" class="bottom-buttons"></div>
  <main class="main">
    {#if !$user.userId}
      <Auth />
    {:else}
      {#if $view.componentId === 'categories'}
        <Categories />
      {:else if $view.componentId === 'dict'}
        <Dict />
      {:else if $view.componentId === 'games'}
        {#if $view.routeId === 'preGame'}
          <PreGame />
        {:else}
          <Learn />
        {/if}
      {:else if $view.componentId === 'home'}
        <Home />
      {:else if $view.componentId === 'setup'}
        <Setup />
      {:else if $view.componentId === 'stat'}
        <Stat />
      {:else if $view.componentId === 'words'}
        {#if $view.routeId === 'editWord'}
          <EditWord />
        {:else}
          <AddWord />
        {/if}
      {:else}
        404
      {/if}
    {/if}
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
    padding: 10px 10px 0;
  }

  #bottom-buttons:empty {
    margin: 0;
    padding: 0;
  }
</style>
