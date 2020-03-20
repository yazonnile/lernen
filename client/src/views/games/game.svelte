<script>
  import BottomButtons from 'sdk/bottom-buttons/bottom-buttons.svelte';
  import Button from 'sdk/button/button.svelte';
  import speech from 'lib/speech/speech';
  import shuffle from 'lib/shuffle/shuffle';
  import { words as wordsStore, user } from 'stores';
  import { onDestroy } from 'svelte';

  let visible = false;
  let activeIndex = 0;
  let wordsIds = shuffle(wordsStore.getWordsByCategoriesAndSetup('rusDeu'));
  let activeWord = 1;
  $: activeWord = $wordsStore[wordsIds[activeIndex]];

  const showTranslation = () => {
    visible = true;
    speech.sayWord(activeWord, $user);
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
  <div class="game" on:click={showTranslation}>
    <slot {activeWord} {visible} />

    <BottomButtons>
      <Button text="Следующий" on:click={nextWord} />
    </BottomButtons>
  </div>
{/if}

<style>
  .game {
    display: flex;
    font-size: 25px;
    line-height: 35px;
    flex-direction: column;
    text-align: center;
  }
</style>
