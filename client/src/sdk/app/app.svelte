<script>
  import 'api/get-initial-state/get-initial-state';
  import { loadInitialData } from 'api/load-initial-data/load-initial-data';
  import Messages from 'sdk/messages/messages.svelte';
  import Intro from 'sdk/intro/intro.svelte';
  import Header from 'sdk/header/header.svelte';
  import * as views from 'views/views';
  import { view } from 'stores';

  let activeComponent;
  $: activeComponent = views[$view.viewId] || views.home;

  let introActive = !process.env.DEV;
  let introToHide = false;
  let dataReady = false;

  loadInitialData({
    callback: () => {
      dataReady = true
    }
  });
</script>

<div class="app">
  {#if introActive}
    <Intro {dataReady} bind:introActive bind:introToHide />
  {/if}

  {#if !introActive || introToHide}
    <Header />

    <div id="bottom-buttons" class="bottom-buttons"></div>
    <main class="main">
      <svelte:component this={activeComponent} />
    </main>

    <Messages />
  {/if}

  <i class="bg"></i>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    position: relative;
    z-index: 1;
  }

  .bg {
    background: url(bg.jpg) 50% 50%;
    background-size: cover;
    display: flex;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: -1;
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
