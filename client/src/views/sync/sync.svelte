<script>
  import Auth from 'views/auth/auth.svelte';
  import Button from 'sdk/button/button.svelte';
  import { syncData } from 'api/sync-data/sync-data';
  import { sync, user } from 'stores';

  const clearLocalData = () => {
    sync.reset();
  };
</script>

<div class="sync">
  {#if !$user.userId}
    <Auth />
  {/if}

  <div class="row">
    <h1>Слова</h1>
    <pre>{JSON.stringify($sync.words, null, ' ')}</pre>
  </div>
  <div class="row">
    <h1>Категории</h1>
    <pre>{JSON.stringify($sync.categories, null, ' ')}</pre>
  </div>
  <div class="row">
    <h1>Настройки</h1>
    <pre>{JSON.stringify($sync.setup, null, ' ')}</pre>
  </div>

  {#if $sync && sync.syncRequired()}
    {#if $user.userId}
      <Button
        on:click={syncData}
        text="синхронизировать"
      />
    {/if}

    {#if process.env.DEV}
      <Button
        empty
        on:click={clearLocalData}
        text="стереть данные для синхронизации"
      />
    {/if}
  {/if}
</div>

<style>
  .row,
  .sync :global(.button) {
    margin-bottom: 20px;
  }

  .sync > :global(.button):last-child {
    margin-bottom: 0;
  }
</style>
