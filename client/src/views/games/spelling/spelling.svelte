<script>
  import Game from 'views/games/game.svelte';
  import Core from './spelling-core.svelte';
  import { words } from 'stores';

  let wordId;
  let answerVisible = false;
</script>

<Game let:wordId bind:answerVisible>
  <div class="wrap">
    <div class="cart">{$words[wordId].translation}</div>
    <div class="content">
      <Core original={$words[wordId].original.toLowerCase()} word={$words[wordId]} bind:answerVisible />
    </div>
  </div>
</Game>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cart {
    background: var(--gameSpellingBg);
    font-size: 30px;
    line-height: 35px;
    padding: 10px;
  }

  .content {
    flex: 1;
    margin-top: 10px;
    overflow-x: hidden;
  }

  .cart,
  .content {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
</style>
