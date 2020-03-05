<script>
  export let word;

  import { setup } from 'stores';
</script>

<p>
  {#if $setup.articles}
    {word.article}
  {/if}

  {word.original}
</p>

{#if $setup.plural}
  <p>
    {#if !word.plural}
      plural
    {:else}

      {#if $setup.articles}
        die
      {/if}

      {word.plural}
    {/if}
  </p>
{/if}
