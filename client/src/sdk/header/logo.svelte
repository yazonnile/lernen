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

<a
  href="/"
  class="logo"
  class:home={view.isHomeView($view)}
  on:click|preventDefault={() => view.home()}
>
  {#if !view.isHomeView($view)}
    <span class="icon">
      <Icon name="down" />
    </span>
  {/if}
  <span class="text">
    {#if view.isHomeView($view)}
      <span class="black">le</span>
      <span class="red">rn</span>
      <span class="yellow">en</span>
    {:else}
      {$view.title}
    {/if}
  </span>
</a>

<style>
  .logo {
    align-items: center;
    color: inherit;
    display: flex;
    flex-wrap: nowrap;
    font-size: 16px;
    height: 50px;
    line-height: 30px;
    padding: 10px;
    text-decoration: none;
    vertical-align: top;
  }

  .home {
    font-size: 22px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .icon {
    height: 20px;
    margin: 2px 10px 0 0;
    transform: rotate(90deg);
    width: 20px;
  }

  .text {
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
</style>
