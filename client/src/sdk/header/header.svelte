<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Menu from 'sdk/menu/menu.svelte';

  let menuActive = false;
  const closeMenu = () => {
    menuActive = false;
  };

  const openMenu = () => {
    menuActive = true;
  };

  const logoClick = () => {
    menuActive = true;
  };
</script>

<header class="header">
  <a class="logo" href="/" on:click|preventDefault={logoClick}>Lernen</a>
  <button
    class="header--button header--menu"
    on:click="{openMenu}"
  ><Icon name="menu" /></button>

  {#if 0}
    <button
      class="header--button header--nav"
      on:click="{openMenu}"
    ><Icon name="menu" /></button>
  {/if}

  {#if menuActive}
    <Menu bind:menuActive />
  {/if}
</header>

<style>
  .header {
    background: var(--mainColorLight);
    box-shadow: 0 -10px 10px 10px #000;
    position: relative;
    text-align: center;
  }

  .header .logo {
    color: inherit;
    font-size: 28px;
    font-weight: bold;
    line-height: 40px;
    text-transform: uppercase;
    text-decoration: none;
  }

  .header--button {
    background: none;
    border: 0;
    height: 40px;
    padding: 8px;
    position: absolute;
    top: 0;
    width: 40px;
  }

  .header--menu {
    right: 0;
  }

  .header--nav {
    left: 0;
  }
</style>
