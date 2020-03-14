<script>
  import { games, view } from 'stores';
</script>

<div class="home">
  {#each Object.keys($games) as gameId (gameId)}
    <button class="game" on:click={() => view.preGame({ gameId })}>
      {$games[gameId].buttonText}
    </button>
  {/each}
</div>

<style>
  .game {
    background: var(--mainColorLight);
    box-shadow: 0 0 2px #000;
    font-size: 19px;
    letter-spacing: 1px;
    line-height: 27px;
    border-radius: 5px;
    margin-top: 10px;
    padding: 20px;
    text-transform: uppercase;
    width: 100%;
  }
</style>
