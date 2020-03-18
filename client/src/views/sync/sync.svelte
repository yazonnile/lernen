<script>
  import Button from 'sdk/button/button.svelte';
  import { sync } from 'stores';
</script>

<div>
  <h1>Слова</h1>
  <pre>{JSON.stringify($sync.words, null, ' ')}</pre>
  <br>
  <h1>Категории</h1>
  <pre>{JSON.stringify($sync.categories, null, ' ')}</pre>

  {#if sync.syncRequired()}
    <Button
      text="синхронизировать"
    />
  {/if}
</div>

<style>

</style>
