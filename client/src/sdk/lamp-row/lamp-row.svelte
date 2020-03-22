<script>
  export let error = false;
  export let items = [];
  export let value;

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const onSelect = (e, id) => {
    dispatch('select', id);
  };

  let left;
  let width;
  let buttons;
  const mount = (node) => {
    buttons = node.querySelectorAll('button');
  };

  $: {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === value && buttons) {
        left = buttons[i].offsetLeft;
        width = buttons[i].offsetWidth;
      }
    }
  }
</script>

<div
  use:mount
  class="lamp-row"
  class:error
>
  <div
    class="fake"
    class:fake--first={value === items[0].id}
    class:fake--last={value === items[items.length - 1].id}
    style={left && width && `left: ${left}px; width: ${width}px;`}
  ></div>

  {#each items as { text, id }}
    <button on:click|preventDefault={(e) => onSelect(e,  id)}>{text}</button>
  {/each}
</div>

<style>
  .lamp-row {
    background: #fff;
    border-radius: 20px;
    display: flex;
    justify-content: space-between;
    padding: 2px;
    position: relative;
  }

  .lamp-row :global(button) {
    background: none;
    border: 0;
    flex: 1;
    font-size: 12px;
    line-height: 16px;
    overflow: hidden;
    padding: 10px 5px;
    position: relative;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .fake {
    background: var(--gameStandardBg);
    border-radius: 18px;
    position: absolute;
    left: 2px;
    height: 36px;
    transition: all .3s ease-in-out;
    width: calc(100% - 4px);
  }

  .fake--first {
    border-radius: 18px 0 0 18px;
  }

  .fake--last {
    border-radius: 0 18px 18px 0;
  }

  .error .fake {
    background: var(--buttonRedBg);
  }
</style>
