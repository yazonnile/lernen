<script context="module">
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  const baseAnimation = {
    duration: 500,
    opacity: 0,
    easing: quintOut,
    delay: 500
  };

  const topAnimation = { ...baseAnimation, y: -30 };
  const bottomAnimation = { ...baseAnimation, y: 30 };
</script>

<script>
  export let answerVisible;

  import shuffle from 'lib/shuffle/shuffle';
  import speech from 'lib/speech/speech';
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

  const onDisable = () => {
    wordsStore.disableWords([ wordsIds[activeIndex] ]);
    onRemoveFromQueue();
  };

  const onRemoveFromQueue = () => {
    speech.stop();
    wordsIds.splice(activeIndex, 1);
    wordsIds = [...wordsIds];

    if (activeIndex === wordsIds.length - 1) {
      activeIndex = 0;
    }

    answerVisible = false;
  };
</script>

<Page className="game">
  {#if wordsIds.length}
    <div class="game">
      <div class="buttons">
        {#if answerVisible}
          <div class="buttons-wrap" in:fly|local={topAnimation} out:fly|local={{ ...topAnimation, delay: 0 }}>
            <Button text="Выключить" on:click={onDisable} />
            <Button text="Убрать" on:click={onRemoveFromQueue} />
          </div>
        {/if}
      </div>

      <div class="wrapper">
        <slot wordId={wordsIds[activeIndex]} />
      </div>

      <div class="buttons">
        {#if answerVisible}
          <div class="buttons-wrap" in:fly|local={bottomAnimation} out:fly|local={{ ...bottomAnimation, delay: 0 }}>
            <Button text="Дальше" on:click={onNext} />
          </div>
        {/if}
      </div>
    </div>
  {:else}
    нет слов под данные категории
  {/if}
</Page>

<style>
  :global(.game) {
    display: flex;
  }

  .game {
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
