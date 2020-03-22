<script>
  import Autocomplete from 'sdk/autocomplete/autocomplete.svelte';
  import Icon from 'sdk/icon/icon.svelte';
  import DictWord from './dict-word.svelte';
  import DictButtons from './dict-buttons.svelte';
  import { words, view } from 'stores';
  import { tick } from 'svelte';

  let autocompleteValue = '';
  let result = [];
  let renderResult = [];
  let checked = [];
  let activeLetter = null;
  let initLetterBox = null;
  let alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Ä','Ö','Ü','ẞ'];
  let alphabetWordsByLetters;
  let alphabetWords;

  $: {
    alphabetWordsByLetters = {};
    alphabetWords = [];

    let wordsData = Object.values($words);
    for (let i = 0; i < wordsData.length; i++) {
      const firstLetter = wordsData[i].original[0].toUpperCase();

      if (!alphabetWordsByLetters[firstLetter]) {
        alphabetWordsByLetters[firstLetter] = {};
      }

      alphabetWordsByLetters[firstLetter][wordsData[i].wordId] = 1;
    }

    if (activeLetter) {
      if (alphabetWordsByLetters[activeLetter.innerText]) {
        alphabetWords = Object.keys(alphabetWordsByLetters[activeLetter.innerText]).sort((a, b) => {
          a = $words[a].original.toLowerCase();
          b = $words[b].original.toLowerCase();
          return a > b ? 1 : (a < b ? -1 : 0);
        });
      } else {
        activeLetter = null;
      }
    }
  }

  $: {
    if (autocompleteValue) {
      activeLetter = null;
    }
  }

  $: {
    renderResult = result.filter(wordId => $words[wordId]);
  }

  const onEdit = ({ detail: wordId }) => {
    view.editWord({ wordId });
  };

  const showWordsByLetter = async({ target }) => {
    if (activeLetter === target) {
      activeLetter = null;
      return;
    }

    activeLetter = target;
    await tick();
    activeLetter.parentNode.insertBefore(initLetterBox, activeLetter.nextElementSibling);
    window.scrollTo(0,0);
  };

  const checkbox = (node) => {
    return {
      destroy() {
        checked = checked.filter(n => n.toString() !== node.value.toString());
      }
    }
  };
</script>

<div class="dict">
  <Autocomplete label="Начните вводить слово/фразу" bind:result bind:value={autocompleteValue} />
  {#if autocompleteValue.length > 1 && !renderResult.length}
    <p>слов не найдено</p>
  {/if}

  {#if renderResult.length}
    {#each renderResult as wordId (wordId)}
      <input type="checkbox" bind:group={checked} value={wordId} id={`cat${wordId}`} use:checkbox />
      <DictWord word={$words[wordId]} checked={checked.includes(wordId)} on:edit={onEdit} />
    {/each}
  {:else if !autocompleteValue}
    <div class="alphabet" on:click={showWordsByLetter}>
      {#each alphabet as letter (letter)}
        <button class:active={activeLetter && letter === activeLetter.innerText} disabled={!alphabetWordsByLetters[letter]}>{letter}</button>
      {/each}

      {#if activeLetter}
        <div class="alphabet--letter" bind:this={initLetterBox} on:click|stopPropagation>
          {#each alphabetWords as wordId (wordId)}
            <input type="checkbox" bind:group={checked} value={wordId} id={`cat${wordId}`} use:checkbox />
            <DictWord word={$words[wordId]} checked={checked.includes(wordId)} on:edit={onEdit} />
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <DictButtons bind:checked />
</div>

<style>
  .dict {
    position: relative;
    padding-bottom: 76px;
  }

  input {
    visibility: hidden;
    position: absolute;
  }

  .alphabet {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -1px -1px 0;
  }

  .alphabet button {
    background: var(--mainColorLight);
    border: solid #fff;
    border-width: 0 1px 1px 0;
    flex: 0 0 20%;
    font-size: 20px;
    line-height: 25px;
    padding: 5px 15px;
  }

  .alphabet button:disabled {
    background-color: #eee;
    color: inherit;
  }

  .alphabet--letter {
    flex: 1 0 100%;
    margin: 5px 0;
  }

  .alphabet button.active {
    background: var(--mainColor);
    border-radius: 0 0 10px;
    color: #fff;
    flex: 1;
    position: relative;
  }

  .alphabet button.active:after {
    top: 100%;
    border-style: solid;
    border-width: 10px 10px 0;
    border-color: var(--mainColor) transparent transparent;
    content: '';
    position: absolute;
    left: calc(50% - 10px);
    width: 0;
    height: 0;
    z-index: 1;
  }
</style>
