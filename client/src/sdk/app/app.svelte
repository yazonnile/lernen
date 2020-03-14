<script>
  import 'api/get-initial-state/get-initial-state';
  import { loadInitialState } from 'api/load-initial-data/load-initial-state';
  import ScrollToggle from 'sdk/scroll-toggle/scroll-toggle.svelte';
  import Messages from 'sdk/messages/messages.svelte';
  import Header from 'sdk/header/header.svelte';
  import { onMount } from 'svelte';

  import Auth from 'views/auth/auth.svelte';
  import Categories from 'views/categories/categories.svelte';
  import Dict from 'views/dict/dict.svelte';
  import PreGame from 'views/games/pre-game.svelte';
  import Learn from 'views/games/learn.svelte';
  import Home from 'views/home/home.svelte';
  import Setup from 'views/setup/setup.svelte';
  import Stat from 'views/stat/stat.svelte';
  import AddWord from 'views/words/add-word.svelte';
  import EditWord from 'views/words/edit-word.svelte';

  import { view, user } from 'stores';

  onMount(() => {
    // load initial data if user exists
    if ($user) {
      loadInitialState();
    }
  });
</script>

<div class="app">
  <Header />

  <div id="bottom-buttons" class="bottom-buttons"></div>
  <main class="main">
    {#if !$user}
      <Auth />
    {:else}
      {#if $view.viewId === 'categories'}
        <Categories />
      {:else if $view.viewId === 'dict'}
        <Dict />
      {:else if $view.viewId === 'preGame'}
        <PreGame />
      {:else if $view.viewId === 'learn'}
        <Learn />
      {:else if $view.viewId === 'home'}
        <Home />
      {:else if $view.viewId === 'setup'}
        <Setup />
      {:else if $view.viewId === 'stat'}
        <Stat />
      {:else if $view.viewId === 'editWord'}
        <EditWord />
      {:else if  $view.viewId === 'addWord'}
        <AddWord />
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
