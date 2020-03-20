<script>
  import Game from './game.svelte';
  import Verb from './verb.svelte';
  import Noun from './noun.svelte';

  let activeWord;
  let visible;
</script>

<Game let:activeWord let:visible gameName="rusDeu">
  <div class="item">{activeWord.translation}</div>

  <div class="item item-extra" class:visible>
    {#if activeWord.type === 'noun'}
      <Noun word={activeWord} />
    {:else if activeWord.type === 'verb'}
      <Verb word={activeWord} />
    {:else}
      {activeWord.original}
    {/if}
  </div>
</Game>

<style>
  .item-extra {
    background: var(--mainColorLight);
    margin-top: 10px;
    opacity: 0;
    padding: 10px;
  }

  .item-extra.visible {
    opacity: 1;
    transition: opacity .5s ease;
  }
</style>
