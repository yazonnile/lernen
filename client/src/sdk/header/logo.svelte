<script>
  import Icon from 'sdk/icon/icon.svelte';
  import { view } from 'stores';

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
      }, 200);
    } else {
      updateTitle();
    }
  }
</script>

<a
  href="/"
  class="logo"
  class:logo--inner={$view.viewId !== homeViewId}
  on:click|preventDefault={() => view.home()}
>
  <i class="black">le</i>
  <i class="red">rn</i>
  <i class="yellow">en</i>
</a>

{#if $view.viewId !== homeViewId}
  <a
    href="/"
    class="logo--wrap"
    class:fly-in-from-right={!$view.initialState}
    on:click|preventDefault={() => view.back()}
  >
    <span class="icon">
      <Icon name="down" />
    </span>

    <span class="text"
      class:text-from-left={!$view.backwardDirection && textTop}
      class:text-from-right={$view.backwardDirection && textTop}
    >
      {title}
    </span>
  </a>
{/if}

<style>
  .logo {
    display: flex;
    font-size: 22px;
    line-height: 30px;
    padding: 10px;
    transition: all .175s linear;
    text-align: center;
    text-decoration: none;
    text-transform: uppercase;
  }

  .logo--inner {
    font-size: 12px;
    font-weight: bold;
    padding: 10px 5px 10px 10px;
  }

  .logo i {
    font-style: normal;
  }

  .logo--wrap {
    align-items: center;
    color: inherit;
    display: flex;
    flex: 1;
    font-size: 12px;
    line-height: 30px;
    overflow: hidden;
    padding: 10px 10px 10px 0;
    flex-wrap: nowrap;
    text-decoration: none;
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
    transition: all .2s ease-in-out;
    text-transform: uppercase;
    white-space: nowrap;
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

  .text-from-left {
    opacity: 0;
    transform: translateX(-50px);
  }

  .text-from-right {
    opacity: 0;
    transform: translateX(50px);
  }
</style>
