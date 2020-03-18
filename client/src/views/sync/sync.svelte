<script>
  import Button from 'sdk/button/button.svelte';
  import syncManager from 'api/sync-manager/sync-manager';
  import request from 'lib/request/request';
  import { sync } from 'stores';

  const toSync = () => {
    request({ api: 'syncData', payload: syncManager.getDataToSync() }).then(response => {
      console.log(response);
    });
  }
</script>

<div>
  <div class="row">
    <h1>Слова</h1>
    <pre>{JSON.stringify($sync.words, null, ' ')}</pre>
  </div>
  <div class="row">
    <h1>Категории</h1>
    <pre>{JSON.stringify($sync.categories, null, ' ')}</pre>
  </div>

  {#if $sync && sync.syncRequired()}
    <div class="row">
      <Button
        on:click={toSync}
        text="синхронизировать"
      />
    </div>
  {/if}
</div>

<style>
  .row {
    margin-bottom: 20px;
  }
</style>
