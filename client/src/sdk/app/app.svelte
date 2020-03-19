<script>
  import 'api/get-initial-state/get-initial-state';
  import { loadInitialData } from 'api/load-initial-data/load-initial-data';
  import Messages from 'sdk/messages/messages.svelte';
  import Header from 'sdk/header/header.svelte';
  import { onMount } from 'svelte';

  import Categories from 'views/categories/categories.svelte';
  import Dict from 'views/dict/dict.svelte';
  import PreGame from 'views/games/pre-game.svelte';
  import Learn from 'views/games/learn.svelte';
  import Home from 'views/home/home.svelte';
  import Setup from 'views/setup/setup.svelte';
  import Stat from 'views/stat/stat.svelte';
  import Sync from 'views/sync/sync.svelte';
  import AddWord from 'views/words/add-word.svelte';
  import EditWord from 'views/words/edit-word.svelte';

  import { view } from 'stores';
  import { Views } from 'stores/view/view';

  onMount(() => {
    // load initial data if user exists
    if ($user) {
      loadInitialData();
    }
  });

  const getActiveComponent = (viewId) => {
    switch (viewId) {
      case Views.categories: return Categories;
      case Views.dict: return Dict;
      case Views.preGame: return PreGame;
      case Views.learn: return Learn;
      case Views.setup: return Setup;
      case Views.stat: return Stat;
      case Views.sync: return Sync;
      case Views.editWord: return EditWord;
      case Views.addWord: return AddWord;
      default: return Home;
    }
  };

  let activeComponent;
  $: activeComponent = getActiveComponent($view.viewId);
</script>

<div class="app">
  <Header />

  <div id="bottom-buttons" class="bottom-buttons"></div>
  <main class="main">
    <svelte:component this={activeComponent} />
  </main>

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
    padding: 20px 10px 10px;
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
