<script>
  import 'api/get-initial-state/get-initial-state';
  import { loadInitialData } from 'api/load-initial-data/load-initial-data';
  import Messages from 'sdk/messages/messages.svelte';
  import Intro from 'sdk/intro/intro.svelte';
  import Header from 'sdk/header/header.svelte';
  import * as views from 'views/views';
  import mountainSvg from './mountain.svg';
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

  let gamePageClass;
  $: gamePageClass = view.isGameView($view);
</script>

<div class={`app ${gamePageClass ? 'app--' + gamePageClass : ''}`}>
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

  <i class="bg">
    {@html mountainSvg}
  </i>
</div>

<style>
  .app {
    background: linear-gradient(to bottom, var(--bgColorContrast), var(--bgColor) 200px);
    display: flex;
    flex-direction: column;
    min-height: 100%;
    position: relative;
    z-index: 1;
  }

  .main {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    padding: 0 10px 10px;
    order: 1;
  }

  .main > :global(*) {
    flex: 1 0 100%;
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

  .bg {
    height: 100%;
    left: 0;
    overflow: hidden;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: -1;
  }

  .bg :global(svg) {
    bottom: 0;
    fill: var(--bgColorContrast);
    left: -5%;
    max-height: 200px;
    max-width: none;
    position: absolute;
    width: 110%;
  }

</style>
