<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import Button from 'sdk/button/button.svelte';
  import Autocomplete from 'sdk/autocomplete/autocomplete.svelte';
  import Icon from 'sdk/icon/icon.svelte';
  import { page } from 'stores';

  let words = Object.keys($page.words);
  let result = [];
  let checked = [];

  $: {
    if (!result.length) {
      checked = [];
    }
  }

  const onEdit = (item) => {
    console.log('onEdit', item);
  };

  const onRemove = () => {
    console.log('onRemove', checked);
  };

  const onTurnOn = () => {
    console.log('onTurnOn', checked);
  };

  const onTurnOff = () => {
    console.log('onTurnOff', checked);
  };
</script>

<DocumentTitle title="dict" />

<div class="dict">
  <Autocomplete {words} bind:result label="Начните вводить слово/фразу" value="t" />

  {#each result as item (item)}
    <input type="checkbox" bind:group={checked} value={item} id={`cat${item}`} />

    <div class="item" class:disabled={!$page.words[item].active}>
      <label class="text" for={`cat${item}`}>{item}</label>

      {#if checked.includes(item)}
        <button class="edit" on:click={() => onEdit(item)}><Icon name="edit" /></button>
      {/if}
    </div>

  {/each}

  {#if checked.length}
    <div class="buttons">
      <button on:click={onTurnOff} class="grey"><Icon name="turn-off" />выкл</button>
      <button on:click={onTurnOn} class="green"><Icon name="turn-on" />вкл</button>
      <button on:click={onRemove} class="red"><Icon name="delete" />удалить</button>
    </div>
  {/if}
</div>

<style>
  .dict {
    position: relative;
    padding-bottom: 66px;
  }

  .item {
    border-top: 1px solid var(--mainColorLight);
    font-size: 16px;
    line-height: 21px;
    position: relative;
  }

  .disabled {
    background: #e0e0e0;
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

  input:checked + .item {
    background: var(--mainColorLight);
  }

  input {
    visibility: hidden;
    position: absolute;
  }

  .text {
    display: block;
    padding: 10px;
  }

  .buttons {
    background: #fff;
    box-shadow: 0 0 5px #000;
    bottom: 0;
    display: flex;
    left: 0;
    padding: 10px;
    position: fixed;
    width: 100%;
  }

  .buttons button {
    border: 0;
    border-radius: 5px;
    font-size: 12px;
    flex: 1;
    line-height: 15px;
    padding: 7px;
    text-align: center;
    text-transform: uppercase;
  }

  .green {
    background: var(--greenColorLight);
  }

  .grey {
    background: var(--categoryColor);
  }

  .red {
    background: var(--redColorLight);
  }

  .buttons button + button {
    margin-left: 10px;
  }

  .buttons :global(.icon) {
    display: block;
    height: 20px;
    margin: 0 auto 7px;
    width: 20px;
  }
</style>
