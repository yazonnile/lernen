<script>
  export let id;
  export let text;
  export let status;
  export let persistent = false;

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
  {text}
</span>

<style>
  .message {
    background: #fff;
    border: 2px solid #ccc;
    display: block;
    margin-top: 10px;
    padding: 5px 10px;
    word-wrap: break-word;
  }

  .message:first-child {
    margin-top: 0;
  }

  .message--success {
    border-color: var(--greenColor);
  }

  .message--error {
    border-color: var(--redColor);
  }
</style>
