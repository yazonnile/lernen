<script>
  import BottomButtons from 'sdk/bottom-buttons/bottom-buttons.svelte';
  import Button from 'sdk/button/button.svelte';
  import Verb from './learn/verb.svelte';
  import Noun from './learn/noun.svelte';
  import speech from 'lib/speech/speech';
  import shuffle from 'lib/shuffle/shuffle';
  import { words as wordsStore, setup } from 'stores';
  import { onDestroy } from 'svelte';

  let visible = false;
  let activeIndex = 0;
  let wordsIds = shuffle(wordsStore.getWordsByCategoriesAndSetup('learn'));
  let activeWord;
  $: activeWord = $wordsStore[wordsIds[activeIndex]];

  const showTranslation = () => {
    visible = true;
    speech.sayWord(activeWord, $setup);
  };

  const nextWord =  () => {
    speech.stop();
    visible = false;
    activeIndex = activeIndex === wordsIds.length - 1 ? 0 : (activeIndex + 1);
  };

  onDestroy(() => {
    speech.stop();
  });
</script>

{#if !wordsIds.length}
  нет слов
{:else}
  <div class="learn" on:click={showTranslation}>
    <div class="item">{activeWord.translation}</div>

    <div class="item item-extra" class:visible>
      {#if activeWord.type === 'noun'}
        <Noun word={activeWord} />
      {:else if activeWord.type === 'verb'}
        <Verb word={activeWord} />
      {:else}
        {activeWord.original}
      {/if}
    </div>

    <BottomButtons>
      <Button text="Следующий" on:click={nextWord} />
    </BottomButtons>
  </div>
{/if}

<style>
  .learn {
    display: flex;
    font-size: 25px;
    line-height: 35px;
    flex-direction: column;
    text-align: center;
  }

  .item-extra {
    background: var(--mainColorLight);
    margin-top: 10px;
    opacity: 0;
    padding: 10px;
  }

  .item-extra.visible {
    opacity: 1;
    transition: opacity .5s ease;
  }
</style>
