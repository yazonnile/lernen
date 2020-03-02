<script>
  import Message from './message.svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { messages } from 'stores';

  const init = node => {
    document.body.appendChild(node);
  };
</script>

{#if $messages.length}
  <div
    use:init
    class="messages-holder"
    transition:fly|local="{{ duration: 300, easing: quintOut, x: 30, opacity: 0 }}"
  >
    {#if $messages.length > 1}
      <button on:click={messages.clearAll}>закрыть все</button>
    {/if}

    {#each $messages as message (message.id)}
      <Message {...message} />
    {/each}
  </div>
{/if}

<style>
  .messages-holder {
    background: rgba(0,0,0,.5);
    bottom: 0;
    padding: 10px;
    position: fixed;
    right: 0;
    width: 250px;
    z-index: 2000;
  }
</style>
