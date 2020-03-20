<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Menu from 'sdk/menu/menu.svelte';
  import { view, user } from 'stores';

  let menuActive = false;
  const openMenu = () => {
    menuActive = true;
  };
</script>

<header class="header">
  <a class="logo" href="/" on:click|preventDefault={() => view.home()}>
    <span class="black">le</span>
    <span class="red">rn</span>
    <span class="yellow">en</span>
  </a>

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
    background: var(--mainColorLight);
    box-shadow: 0 -10px 10px 10px #000;
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
    text-transform: uppercase;
    text-decoration: none;
    vertical-align: top;
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

  .logo span {
    display: block;
    text-shadow: 1px 1px 1px rgba(0,0,0,1), -1px -1px 1px rgba(0,0,0,1);
  }

  .black {
    color: #424242;
  }

  .red {
    color: #de0000;
  }

  .yellow {
    color: var(--categoryActiveColor);
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
