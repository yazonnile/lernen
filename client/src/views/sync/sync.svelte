<script>
  import Button from 'sdk/button/button.svelte';
  import syncManager from 'api/sync-manager/sync-manager';
  import request from 'lib/request/request';
  import { sync, categories, words, messages } from 'stores';

  const toSync = () => {
    request({ api: 'syncData', payload: syncManager.getDataToSync() }).then(response => {
      if (response) {
        const {
          categoriesMap, wordsMap,
          notValidNewCategories = [], notValidUpdatedCategories = [],
          notValidNewWords = [], notValidUpdatedWords = []
        } = response.syncResult;

        // handle not valid data
        if (notValidNewCategories.length) {
          messages.addMessage({ text: 'notValidNewCategories.error' + notValidNewCategories.join(','), status: 'error', persistent: true });
        }

        if (notValidUpdatedCategories.length) {
          messages.addMessage({ text: 'notValidUpdatedCategories.error' + notValidUpdatedCategories.join(','), status: 'error', persistent: true });
        }

        if (notValidNewWords.length) {
          messages.addMessage({ text: 'notValidNewWords.error' + notValidNewWords.join(','), status: 'error', persistent: true });
        }

        if (notValidUpdatedWords.length) {
          messages.addMessage({ text: 'notValidUpdatedWords.error' + notValidUpdatedWords.join(','), status: 'error', persistent: true });
        }

        // update stores with real categories ids
        words.updateWordsCategories(categoriesMap);
        categories.updateCategoriesIds(categoriesMap);

        // update stores with real words ids
        words.updateWordsIds(wordsMap);

        sync.reset();
      }
    });
  };

  const clearLocalData = () => {
    sync.reset();
  };
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
  <div class="row">
    <h1>Настройки</h1>
    <pre>{JSON.stringify($sync.setup, null, ' ')}</pre>
  </div>

  {#if $sync && sync.syncRequired()}
    <div class="row">
      <Button
        on:click={toSync}
        text="синхронизировать"
      />
    </div>
    <div class="row">
      <Button
        empty
        on:click={clearLocalData}
        text="стереть данные для синхронизации"
      />
    </div>
  {/if}
</div>

<style>
  .row {
    margin-bottom: 20px;
  }
</style>
