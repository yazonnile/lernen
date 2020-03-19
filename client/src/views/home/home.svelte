<script>
  import Button from 'sdk/button/button.svelte';
  import { games, view } from 'stores';
</script>

<div class="home">
  {#each Object.keys($games) as gameId (gameId)}
    <Button
      text={$games[gameId].buttonText}
      on:click={() => view.preGame({ gameId })}
    />
  {/each}
</div>

<style>
  .home > :global(.button)  {
    margin-bottom: 10px;
  }
</style>
