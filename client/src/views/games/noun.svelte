<script>
  export let word;

  import { user } from 'stores';
</script>

<p>
  {#if $user.articles}
    {word.article}
  {/if}

  {word.original}
</p>

{#if $user.plural}
  <p>
    {#if !word.plural}
      plural
    {:else}

      {#if $user.articles}
        die
      {/if}

      {word.plural}
    {/if}
  </p>
{/if}
