<script>
  export let answerVisible;

  import shuffle from 'lib/shuffle/shuffle';
  import speech from 'lib/speech/speech';
  import swipe from 'lib/swipe/swipe';
  import Page from 'sdk/page/page.svelte';
  import Button from 'sdk/button/button.svelte';
  import { words as wordsStore, view } from 'stores';

  let activeIndex = 0;
  let wordsIds = wordsStore.getWordsByCategoriesAndSetup($view.viewId);

  if (view.isNounGameView()) {
    wordsIds = wordsIds.filter(wordId => {
      return $wordsStore[wordId].type === 'noun';
    });
  }

  wordsIds = shuffle(wordsIds);

  const onNext = () => {
    speech.stop();
    activeIndex = activeIndex === wordsIds.length - 1 ? 0 : (activeIndex + 1);
    answerVisible = false;
  };

  const onPrev = () => {
    speech.stop();
    activeIndex = activeIndex === 0 ? wordsIds.length - 1 : (activeIndex - 1);
    answerVisible = false;
  };

  const onDisable = () => {
    wordsStore.disableWords([ wordsIds[activeIndex] ]);
    onRemoveFromQueue();
  };

  const onRemoveFromQueue = () => {
    speech.stop();
    answerVisible = false;
    if (activeIndex === wordsIds.length - 1) {
      activeIndex = 0;
    }

    wordsIds.splice(activeIndex, 1);
    wordsIds = [...wordsIds];
  };

  const onSwipe = (direction) => {
    if (direction === -1) {
      onPrev();
    } else {
      onNext();
    }
  }
</script>

<Page className="game">
  {#if wordsIds.length}
    <div class="buttons">
      <div class="buttons-wrap">
        <Button text="Выключить" on:click={onDisable} />
        <Button text="Убрать" on:click={onRemoveFromQueue} />
      </div>
    </div>

    <div class="wrapper" use:swipe={{ onSwipe }}>
      <slot wordId={wordsIds[activeIndex]} />
    </div>

    <div class="buttons">
      <div class="buttons-wrap">
        <Button text={`Дальше (${activeIndex + 1}/${wordsIds.length})`} on:click={onNext} />
      </div>
    </div>
  {:else}
    нет слов под данные категории
  {/if}
</Page>

<style>
  :global(.game) {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .wrapper {
    display: flex;
    flex: 1;
    margin: 0 -10px;
  }

  .wrapper > :global(*) {
    padding: 10px 0;
    width: 100%;
  }

  .buttons {
    display: flex;
    flex: 0 0 46px;
    margin-right: -10px;
  }

  .buttons-wrap {
    display: flex;
    flex: 1;
  }

  .buttons :global(.button) {
    flex: 1;
    margin-right: 10px;
  }
</style>
