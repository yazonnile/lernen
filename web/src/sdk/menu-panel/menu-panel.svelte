<script>
  export let direction = 'left';

  import { fly, fade } from 'svelte/transition';
  import { menu } from 'stores';
</script>

<div class="menu-panel {'menu-panel--' + direction}">
  <div
    class="menu-panel--wrap"
    transition:fly="{{ x: 200 * (direction === 'left' ? -1 : 1), opacity: 0, duration: 300 }}"
  ><slot></slot></div>
  <i
    class="menu-panel--overlay"
    on:click="{menu.hide}"
    transition:fade
  ></i>
</div>

<style>
  .menu-panel {
    position: absolute;
    top: 0;
    width: 80%;
    z-index: 1;
  }

  .menu-panel--left {
    left: 0;
  }

  .menu-panel--right {
    right: 0;
  }

  .menu-panel--wrap {
    background: #ccc;
    height: 100vh;
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  .menu-panel--left .menu-panel--wrap {
    box-shadow: -15px 0 10px 10px #000;
  }

  .menu-panel--right .menu-panel--wrap {
    box-shadow: 15px 0 10px 10px #000;
  }

  .menu-panel--overlay {
    background: rgba(0,0,0,.5);
    content: '';
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;
  }
</style>
