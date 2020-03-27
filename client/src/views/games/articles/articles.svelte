<script>
  import LampRow from 'sdk/lamp-row/lamp-row.svelte';
  import Game from 'views/games/game.svelte';
  import { words } from 'stores';

  let wordId;
  let answerVisible = false;

  const articlesForLamp = [
    { id: 'der', text: 'der' },
    { id: 'die', text: 'die' },
    { id: 'das', text: 'das' },
  ];

  let selectedArticle = null;
  const onSelect = ({ detail }) => {
    if (!selectedArticle) {
      selectedArticle = detail;
      answerVisible = true;
    }
  };

  $: {
    if (!answerVisible) {
      selectedArticle = null;
    }
  }
</script>

<Game let:wordId bind:answerVisible>
  <div class="wrap">
    <div class="cart">
      <div class="answer">
        {#if answerVisible}
          <p class="scale-in">
            {$words[wordId].article}
          </p>
        {/if}
      </div>

      <p>{$words[wordId].original}</p>
    </div>
    <div class="cart">
      <LampRow
        on:select={onSelect}
        error={selectedArticle && $words[wordId].article !== selectedArticle}
        value={selectedArticle}
        items={articlesForLamp}
      />
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
    align-items: center;
    background: var(--gameArticlesBg);
    display: flex;
    flex: 0 0 calc(50% - 5px);
    flex-direction: column;
    font-size: 30px;
    justify-content: center;
    line-height: 35px;
    text-align: center;
  }

  .cart + .cart {
    background: none;
    margin-top: 10px;
  }

  .answer {
    min-height: 35px;
  }

  .wrap :global(.lamp-row) {
    border-radius: 50px;
    width: calc(100% - 20px);
  }

  .wrap :global(.lamp-row--fake) {
    background: var(--gameArticlesBg);
    border-radius: 46px;
    height: 95px;
  }

  .wrap :global(.lamp-row--error .lamp-row--fake) {
    background: var(--buttonRedBg);
  }

  .wrap :global(.lamp-row--fake--first) {
    border-radius: 46px 0 0 46px;
  }

  .wrap :global(.lamp-row--fake--last) {
    border-radius: 0 46px 46px 0;
  }

  .wrap :global(.lamp-row button) {
    font-size: inherit;
    line-height: inherit;
    padding: 30px 5px;
    text-transform: none;
  }
</style>
