<script>
  import Game from 'views/games/game.svelte';
  import { words, user } from 'stores';

  let wordId;
  let answerVisible = false;

  const getWordToShow = (word) => {
    return `${word.article && $user.articles ? word.article : ''} ${word.original}`;
  }
</script>

<Game let:wordId bind:answerVisible>
  <div
    class="wrap"
    on:click={() => (answerVisible = true)}
  >
    <div class="cart">
      {getWordToShow($words[wordId])}
    </div>
    {#if answerVisible}
      <div class="cart scale-in">
        {$words[wordId].translation}
      </div>
    {/if}
  </div>
</Game>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cart {
    align-items: center;
    background: var(--gameTranslationFirstBg);
    display: flex;
    flex: 0 0 calc(50% - 5px);
    font-size: 30px;
    justify-content: center;
    line-height: 35px;
    text-align: center;
  }

  .cart + .cart {
    margin-top: 10px;
  }
</style>
