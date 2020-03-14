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
    transition:fly|local="{{ duration: 300, easing: quintOut, y: -30, opacity: 0 }}"
  >
    {#each $messages as message (message.id)}
      <Message {...message} />
    {/each}
  </div>
{/if}

<style>
  .messages-holder {
    background: var(--mainColorLight);
    box-shadow: 0 0 5px #000;
    padding: 10px;
    position: fixed;
    right: 0;
    top: 0;
    width: 100%;
    z-index: 2000;
  }
</style>
