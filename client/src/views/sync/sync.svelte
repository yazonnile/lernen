<script>
  import Auth from 'views/auth/auth.svelte';
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

<div class="sync">
  {#if !$user.userId}
    <div class="box form">
      <p class="error">Войдите в свой аккаунт, чтобы не потерять свои слова</p>
      <Auth />
    </div>
  {/if}

  <div class="box">
    <h2>Слов: {Object.keys($words).length}</h2>
    {#if process.env.DEV}
      <pre>{JSON.stringify($sync.words, null, ' ')}</pre>
    {/if}
  </div>

  <div class="box">
    <h2>Категорий: {Object.keys($categories).length}</h2>
    {#if process.env.DEV}
      <pre>{JSON.stringify($sync.categories, null, ' ')}</pre>
    {/if}
  </div>

  {#if process.env.DEV}
    <div class="box">
      <h1>Настройки</h1>
      <pre>{JSON.stringify($sync.setup, null, ' ')}</pre>
    </div>
  {/if}

  {#if $sync && sync.syncRequired()}
    {#if $user.userId}
      <Button
        on:click={syncData}
        text="синхронизировать"
      />
    {/if}

    {#if process.env.DEV}
      <Button
        on:click={clearLocalData}
        text="стереть данные для синхронизации"
      />
    {/if}
  {/if}

  {#if $user.userId}
    <Button text="выйти" on:click={onLogout} color="red" />
  {/if}

  <p>{process.env.VERSION}</p>
</div>

<style>
  .box {
    background: #fff;
    box-shadow: 0 0 3px #000;
    border-radius: 5px;
    margin-bottom: 20px;
    padding: 10px;
  }

  .box.form {
    background: linear-gradient(to bottom, var(--mainColorLight), #fff)
  }

  .box .error {
    color: var(--redColor);
    margin-bottom: 10px;
  }

  .box,
  .sync :global(.button) {
    margin-bottom: 10px;
  }

  .sync > :global(.button):last-child,
  .sync :global(form + .button) {
    margin-bottom: 0;
  }

  h2 {
    margin-bottom: 10px;
  }

  h2:only-child {
    margin-bottom: 0;
  }
</style>
