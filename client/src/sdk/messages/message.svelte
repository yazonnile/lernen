<script>
  export let id;
  export let text;
  export let status;
  export let persistent = false;

  import Icon from 'sdk/icon/icon.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { messages } from 'stores';

  let timer;
  const clearMessage = () => {
    clearTimeout(timer);
    messages.clearById(id);
  };

  onMount(() => {
    if (!persistent) {
      timer = setTimeout(clearMessage, 5000);
    }
  });

  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

<span
  class={`message message--${status}`}
  on:click={clearMessage}
  transition:fly|local="{{ duration: 300, easing: quintOut, x: 30, opacity: 0 }}"
>
  <span class="text">
    {text}
  </span>

  <Icon name="close" />
</span>

<style>
  .message {
    border-radius: 5px;
    display: block;
    margin-top: 10px;
    overflow: hidden;
    padding: 5px 28px 5px 10px;
    position: relative;
    word-wrap: break-word;
  }

  .message:first-child {
    margin-top: 0;
  }

  .message--success {
    background: var(--greenColorLight);
  }

  .message--error {
    background: var(--redColorLight);
  }

  .message span {
    position: relative;
    z-index: 2;
  }

  .message :global(.icon) {
    height: 10px;
    position: absolute;
    right: 9px;
    top: 9px;
    width: 10px;
    z-index: 1;

  }
</style>
