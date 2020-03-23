<script>
  import Message from './message.svelte';
  import { messages } from 'stores';
</script>

<div class="messages-holder">
  {#each $messages as message (message.id)}
    <Message {...message} />
  {/each}
</div>

<style>
  .messages-holder {
    box-shadow: 0 0 5px #000;
    position: fixed;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 2000;
  }

  .messages-holder:empty {
    box-shadow: none;
  }
</style>
