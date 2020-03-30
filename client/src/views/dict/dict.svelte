<script>
  import Autocomplete from 'sdk/autocomplete/autocomplete.svelte';
  import BodyPortal from 'sdk/body-portal/body-portal.svelte';
  import Page from 'sdk/page/page.svelte';
  import DictLetterBox from './dict-letter-box.svelte';
  import DictWord from './dict-word.svelte';
  import DictAZ from './dict-az.svelte';
  import DictButtons from './dict-buttons.svelte';
  import alphabet from 'api/a-z/a-z';
  import { words, view } from 'stores';

  let autocompleteValue = '';
  let result;
  let wordId; // to avoid ide errors with svelte syntax
  let checked = [];

  let wordsByLetters;
  $: wordsByLetters = words.getWordsByLetters($words);

  const onEdit = ({ detail: wordId }) => {
    view.editWord({ wordId });
  };

  const checkbox = (node) => {
    return {
      destroy() {
        checked = checked.filter(n => n.toString() !== node.value.toString());
      }
    }
  };
</script>

<Page className="dict">
  <Autocomplete label="Начните вводить слово/фразу" bind:result bind:value={autocompleteValue} />

  <div class="holder">
    <div class="alphabet-holder">
      <DictAZ {alphabet} {wordsByLetters} {result} />
    </div>

    <div class="words-holder">
      {#each alphabet as letter}
        <DictLetterBox {letter} {result} wordsByLetter={wordsByLetters[letter]} let:wordId={wordId}>
          <input type="checkbox" bind:group={checked} value={wordId} id={`cat${wordId}`} use:checkbox />
          <DictWord word={$words[wordId]} checked={checked.includes(wordId)} on:edit={onEdit} />
        </DictLetterBox>
      {/each}
    </div>
  </div>

  <BodyPortal>
    <DictButtons bind:checked />
  </BodyPortal>
</Page>

<style>
  :global(.dict) {
    position: relative;
    padding-bottom: 76px;
  }

  input {
    visibility: hidden;
    position: absolute;
  }

  .holder {
    align-content: flex-start;
    display: flex;
    flex-wrap: nowrap;
    margin: 0 -10px;
    padding-top: 10px;
  }

  .words-holder {
    flex: 1;
    padding-left: 10px;
    width: calc(100% - 20px);
  }

  .words-holder :global(.form-box) {
    margin-right: 0;
  }

  .words-holder :global(.form-box .title) {
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    z-index: 1;
  }

  .words-holder :global(.form-box .title h2) {
    background: var(--gameStandardBgContrast);
    padding: 0 20px;
  }
</style>
