<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Page from 'sdk/page/page.svelte';
  import { games, view } from 'stores';

  const onGameClick = (gameId) => {
    const game = $games[gameId];

    if (game.categories) {
      view.preGame({ gameId });
    }
  };
</script>

<Page className="home" homePage>
  {#each Object.keys($games) as gameId (gameId)}
    <div class="section" on:click={() => onGameClick(gameId)}>
      <div class="text">
        <span class="title">
          {$games[gameId].buttonText}
        </span>
        <p>{$games[gameId].description}</p>
      </div>
      <span class="icon">
        <Icon name="down" />
      </span>
    </div>
  {/each}
</Page>

<style>
  :global(.home) {
    margin: 0 -10px;
  }

  .section {
    align-items: center;
    display: flex;
    margin-top: 10px;
    padding: 30px 10px 30px 30px;
    position: relative;
  }

  .section:first-child {
    margin-top: 0;
  }

  .section:nth-child(1) { background: var(--gameStandardBg); }
  .section:nth-child(2) { background: var(--gameTranslationFirstBg); }
  .section:nth-child(3) { background: var(--gameArticlesBg); }
  .section:nth-child(4) { background: var(--gamePluralBg); }
  .section:nth-child(5) { background: var(--gameSpellingBg); }

  .section .text {
    flex: 1;
    padding-right: 10px;
  }

  .section .title {
    display: block;
    font-size: 20px;
    line-height: 25px;
    margin: 0 0 5px;
    position: relative;
  }

  .icon {
    height: 20px;
    width: 20px;
  }

  .icon :global(.icon) {
    transform: rotate(-90deg);
  }
</style>
