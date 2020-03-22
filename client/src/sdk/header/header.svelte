<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Menu from 'sdk/menu/menu.svelte';
  import Logo from './logo.svelte';

  let menuActive = false;
  const toggleMenu = () => {
    menuActive = !menuActive;
  };

  $: {
    document.body.style.overflow = menuActive ? 'hidden' : '';
  }
</script>

<header class="header">
  <Logo />

  <button
    class="header--button"
    class:header--button--menuActive={menuActive}
    on:click={toggleMenu}
  >
    <Icon name="menu" />
  </button>

  {#if menuActive}
    <Menu bind:menuActive />
  {/if}
</header>

<style>
  .header {
    background: var(--bgColorContrast);
    display: flex;
    flex-wrap: nowrap;
    padding: 0 5px;
    position: relative;
    user-select: none;
  }

  .header--button {
    background: none;
    border: 0;
    color: inherit;
    height: 40px;
    flex: 0 0 40px;
    margin-top: 5px;
    padding: 10px;
    width: 40px;
  }

  .header--button--menuActive {
    background: var(--bgColor);
    border-radius: 20px;
    position: absolute;
    right: 5px;
    text-align: right;
    top: 0;
    z-index: 3;
  }
</style>
