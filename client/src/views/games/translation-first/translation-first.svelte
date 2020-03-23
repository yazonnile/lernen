<script>
  import Game from 'views/games/game.svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { words } from 'stores';

  let wordId;
  let answerVisible = false;
</script>

<Game let:wordId bind:answerVisible>
  <div
    class="wrap"
    on:click={() => (answerVisible = true)}
  >
    <div class="cart">
      {$words[wordId].original.toLowerCase()}
    </div>
    {#if answerVisible}
      <div class="cart" in:fly|local={{ opacity: 0, y: 50, easing: quintOut, duration: 500 }}>
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
