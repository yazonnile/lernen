<script>
  export let letter;
  export let wordsByLetter;
  export let result;

  import FormBox from 'sdk/form-box/form-box.svelte';

  let wordsIds;
  $: {
    if (!wordsByLetter) {
      wordsIds = [];
    } else if (!result) {
      wordsIds = wordsByLetter;
    } else {
      wordsIds = wordsByLetter.filter(w => result.includes(w));
    }
  }
</script>

{#if wordsIds.length}
  <FormBox title={letter}>
    {#each wordsIds as wordId}
      <div>
        <slot {wordId} />
      </div>
    {/each}
  </FormBox>
{/if}
