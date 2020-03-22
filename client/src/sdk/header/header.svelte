<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Menu from 'sdk/menu/menu.svelte';
  import Logo from './logo.svelte';

  let menuActive = true;
  const toggleMenu = () => {
    menuActive = !menuActive;
  };

  $: {
    document.body.style.overflow = menuActive ? 'hidden' : '';
  }
</script>

<header class="header">
  <Logo />
  <div class="buttons">
    <button
      class="header--button"
      class:header--button--menuActive={menuActive}
      on:click={toggleMenu}
    >
      <Icon name="menu" />
    </button>
  </div>

  {#if menuActive}
    <Menu bind:menuActive />
  {/if}
</header>

<style>
  .header {
    background: var(--bgColorContrast);
    display: flex;
    padding-right: 5px;
    position: relative;
  }

  .buttons {
    justify-content: flex-end;
    display: flex;
    flex: 1;
  }

  .header--button {
    background: none;
    border: 0;
    color: inherit;
    height: 40px;
    margin-top: 5px;
    padding: 10px;
    width: 40px;
  }

  .header--button--menuActive {
    background: var(--bgColor);
    border-radius: 20px;
    position: fixed;
    right: 5px;
    text-align: right;
    top: 0;
    z-index: 3;
  }
</style>
