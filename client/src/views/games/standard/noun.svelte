<script>
  export let word;

  import { user } from 'stores';
</script>

<p class="bg-row">
  {#if $user.articles}
    {word.article}
  {/if}

  {word.original}
</p>

{#if $user.plural}
  <p class="bg-row">
    {#if !word.plural}
      plural
    {:else if word.plural === 'kein plural'}
      kein plural
    {:else}

      {#if $user.articles}
        die
      {/if}

      {word.plural}
    {/if}
  </p>
{/if}

<style>
  .bg-row {
    background: var(--gameStandardBg);
    margin-top: 10px;
    padding: 20px;
  }
</style>
