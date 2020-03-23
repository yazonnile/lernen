<script>
  import Auth from './auth.svelte';
  import Page from 'sdk/page/page.svelte';
  import FormBox from 'sdk/form-box/form-box.svelte';
  import Button from 'sdk/button/button.svelte';
  import { syncData } from 'api/sync-data/sync-data';
  import request from 'lib/request/request';
  import { sync, user, words, categories } from 'stores';

  const clearLocalData = () => {
    sync.reset();
  };

  const onLogout = () => {
    if (confirm('Точно выйти?')) {
      // sync data then logout
      syncData().then(() => {
        request({ api: 'logoutUser' }).then(() => {
          user.resetSetup();
          sync.reset();
          $categories = {};
          $words = {};
        });
      });
    }
  };
</script>

<Page className="sync">

  <FormBox title="статистика">
    <div>
      <div class="stat-row">Слов: {Object.keys($words).length}</div>
    </div>
    <div>
      <div class="stat-row">Категорий: {Object.keys($categories).length}</div>
    </div>
  </FormBox>

  {#if $sync && sync.syncRequired()}
    {#if $user.userId}
      <div class="row">
        <Button
          on:click={syncData}
          text="синхронизировать"
        />
      </div>
    {/if}

    {#if process.env.DEV}
      <div class="row">
        <Button
          on:click={clearLocalData}
          text="стереть данные для синхронизации"
        />
      </div>
    {/if}
  {/if}

  <FormBox title="version">
    <div>
      <div class="stat-row">
        {new Date(process.env.VERSION)}
      </div>
    </div>
  </FormBox>

  <div class="row">
    {#if $user.userId}
      <Button text="выйти" on:click={onLogout} color="red" />
    {:else}
      <Auth />
    {/if}
  </div>

  {#if process.env.DEV}
    <div style="margin: 50px 0">
      <pre>{JSON.stringify($sync.words, null, ' ')}</pre>
      <pre>{JSON.stringify($sync.categories, null, ' ')}</pre>
      <pre>{JSON.stringify($sync.setup, null, ' ')}</pre>
    </div>
  {/if}
</Page>

<style>
  .row {
    margin-top: 20px;
  }
  .stat-row {
    padding: 7px 0 6px;
  }
</style>
