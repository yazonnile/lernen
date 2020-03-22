<script>
  export let menuActive;

  import MenuButton from './menu-button.svelte';
  import { view } from 'stores';
  import { fly, fade } from 'svelte/transition';

  const hideMenu = () => {
    menuActive = false;
  };

  const onMenu = (viewId) => {
    if (view[viewId]) {
      view[viewId]();
      hideMenu();
    }
  };

  const menuData = [
    { text: 'Добавить слово', viewId: 'addWord', icon: 'plus' },
    { text: 'словарь', viewId: 'dict', icon: 'dict' },
    { text: 'категории', viewId: 'categories', icon: 'categories' },
    { text: 'синхронизация', viewId: 'sync', icon: 'sync' },
    { text: 'настройки', viewId: 'setup', icon: 'setup' },
  ];

  const duration = 300;
</script>

<div class="menu">
  {#each menuData as { text, viewId, icon }, index}
    <MenuButton
      {icon}
      on:click={() => onMenu(viewId)}
      delay={300 / menuData.length * index}
    >{text}</MenuButton>
  {/each}
  <i class="menu--overlay" on:click={hideMenu} in:fade={{ duration }}></i>
</div>

<style>
  .menu {
    position: absolute;
    right: 0;
    top: 0;
    padding: 45px 24px 0 0;
    z-index: 2;
  }

  .menu--overlay {
    background: rgba(0,0,0,.75);
    content: '';
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;
  }
</style>
