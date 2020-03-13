<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Menu from 'sdk/menu/menu.svelte';
  import { useRoute } from 'lib/router/router';
  import { user } from 'stores';

  let menuActive = false;
  const openMenu = () => {
    menuActive = true;
  };

  const logoClick = () => {
    useRoute({ componentId: 'home' });
  };
</script>

<header class="header">
  <a class="logo" href="/" on:click|preventDefault={logoClick}>
    <span class="black">le</span>
    <span class="red">rn</span>
    <span class="yellow">en</span>
  </a>
  {#if $user.userId}
    <button
      class="header--button header--menu"
      on:click="{openMenu}"
    ><Icon name="menu" /></button>
  {/if}

<!--  <button-->
<!--    class="header&#45;&#45;button header&#45;&#45;nav"-->
<!--    on:click="{openMenu}"-->
<!--  ><Icon name="menu" /></button>-->

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

  /*.header--nav {*/
  /*  left: 0;*/
  /*}*/

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
    color: #f7b800;
  }
</style>
