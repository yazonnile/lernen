<script>
  import Game from 'views/games/game.svelte';
  import Verb from './verb.svelte';
  import Noun from './noun.svelte';
  import speech from 'lib/speech/speech';
  import { words, user } from 'stores';

  const showTranslation = (word) => {
    answerVisible = true;
    speech.sayWord(word, $user);
  };

  let wordId;
  let answerVisible = false;
</script>

<Game let:wordId bind:answerVisible>
  <div class="learn" on:click={() => showTranslation($words[wordId])}>
    <div class="item">{$words[wordId].translation}</div>

    <div class="answer">
      {#if answerVisible}
        <div class="scale-in">
          {#if $words[wordId].type === 'noun'}
            <Noun word={$words[wordId]} />
          {:else if $words[wordId].type === 'verb'}
            <Verb word={$words[wordId]} />
          {:else}
            <div class="item">{$words[wordId].original}</div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</Game>


<style>
  .learn {
    display: flex;
    font-size: 25px;
    line-height: 35px;
    flex-direction: column;
    text-align: center;
  }

  .item {
    background: var(--gameStandardBg);
    flex: 0;
    padding: 20px;
  }

  .answer {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
  }
</style>
