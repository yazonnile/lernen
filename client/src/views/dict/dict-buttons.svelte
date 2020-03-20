<script>
  export let checked;

  import Icon from 'sdk/icon/icon.svelte';
  import { words } from 'stores';

  const editWords = (selectedWordsAction) => {
    switch (selectedWordsAction) {
      case 'deleteWords':
        words.deleteWords(checked);
        break;

      case 'enableWords':
        words.enableWords(checked);
        break;

      case 'disableWords':
        words.disableWords(checked);
        break;
    }

    checked = [];
  };

  const onRemove = () => editWords('deleteWords');
  const onTurnOn = () => editWords('enableWords');
  const onTurnOff = () => editWords('disableWords');
</script>

<div class="buttons" class:buttons--active={checked.length}>
  <button on:click={onTurnOff} class="grey"><Icon name="turnOff" />выкл</button>
  <button on:click={onTurnOn} class="green"><Icon name="turnOn" />вкл</button>
  <button on:click={onRemove} class="red"><Icon name="delete" />удалить</button>
</div>

<style>
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
