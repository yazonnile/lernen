<script>
  export let alphabet;
  export let wordsByLetters;
  export let result;
</script>

{#if !result || result.length}
  <div class="alphabet">
    {#each alphabet as letter (letter)}
      {#if wordsByLetters[letter] && (!result || wordsByLetters[letter].find(wordId => result.includes(wordId)))}
        <a href="#{letter}" class="alphabet--letter">{letter}</a>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .alphabet {
    flex: 0 0 20px;
    display: flex;
    flex-direction: column;
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    width: 20px;
  }

  .alphabet--letter {
    color: inherit;
    flex: 1;
    font-size: 12px;
    line-height: 15px;
    padding: 2px 0;
    text-align: center;
    text-decoration: none;
  }
</style>
