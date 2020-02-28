<script>
  export let menuActive;

  import { useRoute } from 'lib/router/router';
  import { page } from 'stores';
  import { fly, fade } from 'svelte/transition';

  const hideMenu = () => {
    menuActive = false;
  };

  const onLogout = () => {
    hideMenu();
    useRoute({ ...$page.activeRoute, payload: { logout: true } });
  };

  const onMenu = (componentId) => {
    hideMenu();
    useRoute({ componentId });
  };
</script>

<div class="menu">
  <div class="menu--wrap" transition:fly="{{ x: 200, opacity: 0, duration: 300 }}">
    <div>
      <button on:click={() => onMenu('addWord')}>Добавить слово</button>
      <button on:click={() => onMenu('setup')}>Настройки</button>
      <button on:click={() => onMenu('dict')}>Мой словарь</button>
      <button on:click={() => onMenu('stat')}>Моя статистика</button>
    </div>

    <button on:click={onLogout}>выйти</button>
  </div>
  <i class="menu--overlay" on:click={hideMenu} transition:fade></i>
</div>

<style>
  .menu {
    position: absolute;
    right: 0;
    text-align: left;
    top: 0;
    width:75%;
    z-index: 1;
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

  .menu--wrap {
    background: #fff;
    box-shadow: 5px 0 7px 5px #000;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  button {
    background: var(--mainColorLight);
    border: 0;
    padding: 20px;
    text-transform: uppercase;
    width: 100%;
  }

  button + button {
    border-top: 1px solid #fff;
  }
</style>
