<script>
  import BottomButtons from 'sdk/bottom-buttons/bottom-buttons.svelte';
  import Button from 'sdk/button/button.svelte';
  import request from 'lib/request/request';
  import { syncData } from 'api/sync-data/sync-data';
  import { user, words, categories, sync } from 'stores';

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

<div class="stat">
  <h2>Слов: {Object.keys($words).length}</h2>
  <h2>Категорий: {Object.keys($categories).length}</h2>

  {#if $user.userId}
    <BottomButtons>
      <Button text="выйти" on:click={onLogout} color="red" />
    </BottomButtons>
  {/if}
</div>

<style>
  h2 {
    margin-bottom: 10px;
  }
</style>
