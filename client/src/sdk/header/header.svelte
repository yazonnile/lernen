<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Menu from 'sdk/menu/menu.svelte';
  import { view, user } from 'stores';

  let menuActive = false;
  const openMenu = () => {
    menuActive = true;
  };

  $: {
    document.body.style.overflow = menuActive ? 'hidden' : '';
  }
</script>

<header class="header">
  <a class="logo" href="/" on:click|preventDefault={() => view.home()}>lernen</a>

  <button
    class="header--button header--menu"
    on:click={openMenu}
  ><Icon name="menu" /></button>

  <button
    class="header--button header--nav"
    on:click={() => view.sync()}
  >
    <Icon name="profile" />
    {#if !$user.userId}
      <i class="attention"></i>
    {/if}
  </button>

  {#if menuActive}
    <Menu bind:menuActive />
  {/if}
</header>

<style>
  .header {
    position: relative;
    text-align: center;
  }

  .header .logo {
    color: inherit;
    display: inline-flex;
    font-size: 28px;
    font-weight: bold;
    height: 40px;
    overflow: hidden;
    padding: 0 10px;
    line-height: 40px;
    text-shadow: var(--textHeaderShadow);
    text-transform: uppercase;
    text-decoration: none;
    vertical-align: top;
  }

  .header--button {
    background: none;
    border: 0;
    color: inherit;
    filter: drop-shadow(var(--textHeaderShadow));
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

  .attention {
    background: var(--redColor);
    border-radius: 7px;
    bottom: 5px;
    color: #fff;
    font-style: normal;
    font-size: 11px;
    height: 14px;
    line-height: 14px;
    right: 2px;
    position: absolute;
    text-align: center;
    width: 14px;
  }
  .attention:after {
    content: '!';
  }
</style>
