<script>
  export let menuActive;

  import { fly, fade } from 'svelte/transition';

  const hideMenu = () => {
    menuActive = false;
  };
</script>

<div class="menu">
  <div class="menu--wrap" transition:fly="{{ x: 200, opacity: 0, duration: 300 }}">
    MENU
  </div>
  <i class="menu--overlay" on:click={hideMenu} transition:fade></i>
</div>

<style>
  .menu {
    position: absolute;
    right: 0;
    top: 0;
    width:75%;
    z-index: 1;
  }

  .menu--wrap {
    background: #fff;
    height: 100vh;
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  .menu--overlay {
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
