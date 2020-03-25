<script context="module">
  import { fly } from 'svelte/transition';

  const duration = 250;
  const animationOptions = { opacity: 0, duration };
  const inAnimation = { ...animationOptions, delay: duration };
  const outAnimation = { ...animationOptions, delay: 0 };
</script>

<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Menu from 'sdk/menu/menu.svelte';
  import { view, user } from 'stores';

  let menuActive = false;
  const openMenu = () => { menuActive = true; };

  let title;
  let viewId;
  let textTop = false;

  const homeViewId = view.getHomeViewId();

  const updateTitle = () => {
    title = $view.title;
    viewId = $view.viewId;
  };

  $: {
    if (viewId && homeViewId !== $view.viewId && homeViewId !== viewId) {
      textTop = true;
      setTimeout(() => {
        updateTitle();
        textTop = false;
      }, duration);
    } else {
      updateTitle();
    }
  }

  $: document.body.style.overflow = menuActive ? 'hidden' : '';
</script>

<a
  href="/"
  class="logo"
  on:click|preventDefault={() => view.home()}
>
  {#if $view.viewId === homeViewId}
    <span
      class="logo--wrap"
      in:fly|local={{ x: -50, ...inAnimation }}
      out:fly|local={{ x: -50, ...outAnimation }}
    >
      <span class="text text--home">
        <span class="black">le</span>
        <span class="red">rn</span>
        <span class="yellow">en</span>
      </span>
    </span>
  {:else}
    <span
      class="logo--wrap"
      in:fly|local={{ x: 50, ...inAnimation }}
      out:fly|local={{ x: 50, ...outAnimation }}
    >
      <span class="icon">
        <Icon name="down" />
      </span>

      <span
        class="text"
        class:text--top={textTop}
        style="transition-duration: {duration}ms;"
      >
        {title}
      </span>
    </span>
  {/if}
</a>

<style>
  .logo {
    color: inherit;
    display: flex;
    flex: 1;
    font-size: 12px;
    height: 50px;
    line-height: 30px;
    overflow: hidden;
    padding: 10px;
    text-decoration: none;
  }

  .logo--wrap {
    align-items: center;
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
  }

  .icon {
    flex: 0 0 20px;
    height: 20px;
    margin-right: 10px;
    transform: rotate(90deg);
    width: 20px;
  }

  .text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    transition-property: all;
    transition-timing-function: ease-in-out;
    white-space: nowrap;
  }

  .text--top {
    opacity: 0;
    transform: translateY(-50px);
  }

  .text--home {
    display: flex;
    font-size: 22px;
    font-weight: bold;
  }

  .black {
    color: #424242;
  }

  .red {
    color: var(--redColor);
  }

  .yellow {
    color: var(--yellowColor);
  }
</style>
