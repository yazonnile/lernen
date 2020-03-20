<script>
  export let word;
  export let checked;

  import Icon from 'sdk/icon/icon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const onEdit = () => {
    dispatch('edit', word.wordId);
  };
</script>

<div class="item" class:disabled={!word.active}>
  <label class="text" for={`cat${word.wordId}`}>{word.original}</label>

  {#if !word.active && !checked}
    <Icon name="turnOff" />
  {/if}

  {#if checked}
    <button class="edit" on:click={onEdit}><Icon name="edit" /></button>
  {/if}
</div>

<style>
  .item {
    border-top: 1px solid var(--mainColorLight);
    font-size: 16px;
    line-height: 21px;
    position: relative;
    transition: background-color .3s ease;
  }

  .disabled {
    background: linear-gradient(to right, #ececec, #fff);
  }

  .item :global(.icon-turnOff) {
    color: #ccc;
    height: 21px;
    position: absolute;
    right: 10px;
    top: 10px;
    width: 21px;
  }

  .item:first-of-type {
    border: 0;
  }

  .edit {
    background: none;
    border: 0;
    border-radius: 5px;
    padding: 10px;
    position: absolute;
    right: 0;
    top: 0;
  }

  .edit :global(.icon) {
    height: 21px;
    width: 21px;
  }

  :global(input:checked) + .item {
    background: var(--mainColorLight);
  }

  .text {
    display: block;
    padding: 10px;
  }
</style>
