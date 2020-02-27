<script>
  import Button from 'sdk/button/button.svelte';
  import Autocomplete from 'sdk/autocomplete/autocomplete.svelte';
  import { view, data } from 'stores';
  import request from 'lib/request/request';

  let keys = Object.keys($data);
  let result = [];
  let checked = [];
  let wordsCount = keys.filter(key => $data[key].type === 'word').length;
  let phrasesCount = keys.filter(key => $data[key].type === 'phrase').length;

  $: {
    if (!result.length) {
      checked = [];
    }
  }

  const on = () => {
    request('/on', checked).then(responseData => {
      if (responseData) {
        data.on(checked);
      }
    });
  };

  const off = () => {
    request('/off', checked).then(responseData => {
      if (responseData) {
        data.off(checked);
      }
    });
  };

  const getLength = (arr) => {
    return `${arr.length}/${arr.filter(key => !$data[key].active).length}`;
  };
</script>

<div class="words">
  <div class="body">
    <Autocomplete {keys} bind:result label="Начните вводить слово/фразу" />

    {#each result as item, index (item)}
      <label>
        <input type="checkbox" bind:group={checked} value={item} />
        <span class="item" class:active={$data[item].active}>{item}</span>
      </label>
    {/each}

    <div class="stat">
      <p>Всего - {getLength(Object.keys($data))}</p>
      <p>Слов - {getLength(keys.filter(key => $data[key].type === 'word'))}</p>
      <p>Существительных - {getLength(keys.filter(key => $data[key].wordType === 'noun'))}</p>
      <p>Глаголов - {getLength(keys.filter(key => $data[key].wordType === 'verb'))}</p>
      <p>Других - {getLength(keys.filter(key => $data[key].wordType === 'other'))}</p>
      <p>Фраз - {getLength(keys.filter(key => $data[key].type === 'phrase'))}</p>
    </div>
  </div>

  {#if checked.length}
    <div class="buttons">
      <Button text="Включить" on:click={on} />
      <Button text="Отлючить" on:click={off} color="red" />
    </div>
  {/if}
</div>

<style>
  .words {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .body {
    flex: 1;
  }

  label {
    display: block;
  }

  label + label {
    border-top: 1px dashed var(--mainColorLight);
  }

  .item {
    background: #f1f1f1;
    display: block;
    font-size: 16px;
    line-height: 21px;
    opacity: .5;
    padding: 10px;
  }

  .active {
    background: none;
    opacity: 1;
  }

  label input {
    visibility: hidden;
    position: absolute;
  }

  input:checked + .item {
    background: var(--mainColorLight);
    position: relative;
  }

  input:checked + .item::after {
    background: linear-gradient(to right, var(--mainColorLight), #fff);
    bottom: 0;
    content: '';
    height: 100%;
    right: 0;
    position: absolute;
    width: 35px;
  }

  .buttons {
    display: flex;
    margin: 10px 0 0 -10px;

  }

  .buttons :global(.button) {
    flex: 1 0 calc(50% - 10px);
    margin: 0 0 0 10px;
  }

  .stat {
    margin-top: 20px;
  }
</style>
