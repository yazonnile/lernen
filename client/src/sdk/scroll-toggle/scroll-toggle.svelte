<script>
  import Icon from 'sdk/icon/icon.svelte';

  let reverse = false;
  let scrollY;
  $: visible = scrollY > 250 || (scrollY === 0 && reverse);

  const clickHandler = () => {
    if (reverse) {
      scrollY = reverse;
      reverse = false;
    } else {
      reverse = scrollY;
      scrollY = 0;
    }
  };

  const scrollHandler = () => {
    if (scrollY > 0) {
      reverse = false;
    }
  };
</script>

<svelte:window bind:scrollY on:scroll="{scrollHandler}" />
{#if visible}
  <button
    class="scroll-toggle"
    class:scroll-toggle--reverse="{reverse}"
    on:click="{clickHandler}"
  >
    <Icon name="down" />
  </button>
{/if}

<style>
  .scroll-toggle {
    background: none;
    border: 0;
    bottom: 10px;
    cursor: pointer;
    height: 50px;
    left: 10px;
    padding: 9px;
    position: fixed;
    width: 50px;
  }

  .scroll-toggle :global(.icon-down) {
    background: #ccc;
    border-radius: 20px;
    color: #fff;
    height: 32px;
    padding: 8px 8px 6px;
    transform: rotate(180deg);
  }

  .scroll-toggle--reverse :global(.icon-down) {
    transform: rotate(0);
  }
</style>
