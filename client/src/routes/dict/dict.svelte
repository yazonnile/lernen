<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import Autocomplete from 'sdk/autocomplete/autocomplete.svelte';
  import Icon from 'sdk/icon/icon.svelte';
  import { useRoute } from 'lib/router/router';
  import { words } from 'stores';

  let result = [];
  let checked = [];

  $: {
    if (!result.length) {
      checked = [];
    }
  }

  const editWords = (routeId) => {
    useRoute({
      componentId: 'dict',
      routeId,
      payload: {
        wordsIds: checked.map(id => $words[id].wordId)
      }
    }, ({ enabledIds, disabledIds, deletedIds }) => {
      switch (routeId) {
        case 'deleteWords':
          words.deleteWords(deletedIds);
          break;

        case 'enableWords':
          words.enableWords(enabledIds);
          break;

        case 'disableWords':
          words.disableWords(disabledIds);
          break;
      }

      checked = [];
    });
  };

  const onEdit = (wordId) => {
    useRoute({ componentId: 'words', routeId: 'editWord', params: { wordId } });
  };

  const onRemove = () => editWords('deleteWords');
  const onTurnOn = () => editWords('enableWords');
  const onTurnOff = () => editWords('disableWords');
</script>

<DocumentTitle title="Словарь" />

<div class="dict">
  <Autocomplete data={words.getWordsArray()} bind:result label="Начните вводить слово/фразу" />

  {#each result as wordId (wordId)}
    <input type="checkbox" bind:group={checked} value={wordId} id={`cat${wordId}`} />

    <div class="item" class:disabled={!$words[wordId].active}>
      <label class="text" for={`cat${wordId}`}>{$words[wordId].original}</label>

      {#if !$words[wordId].active && !checked.includes(wordId)}
        <Icon name="turn-off" />
      {/if}

      {#if checked.includes(wordId)}
        <button class="edit" on:click={() => onEdit(wordId)}><Icon name="edit" /></button>
      {/if}
    </div>

  {/each}

  <div class="buttons" class:buttons--active={checked.length}>
    <button on:click={onTurnOff} class="grey"><Icon name="turn-off" />выкл</button>
    <button on:click={onTurnOn} class="green"><Icon name="turn-on" />вкл</button>
    <button on:click={onRemove} class="red"><Icon name="delete" />удалить</button>
  </div>
</div>

<style>
  .dict {
    position: relative;
    overflow: hidden;
    padding-bottom: 76px;
  }

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

  .item :global(.icon-turn-off) {
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
    bottom: -100px;
    display: flex;
    left: 0;
    opacity: 0;
    padding: 10px;
    position: fixed;
    transition: all .3s ease;
    width: 100%;
  }

  .buttons--active {
    bottom: 0;
    opacity: 1;
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
