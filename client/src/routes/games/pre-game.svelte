<script>
  import List from 'sdk/categories/categories-list.svelte';
  import Button from 'sdk/button/button.svelte';
  import { useRoute } from 'lib/router/router';
  import { page } from 'stores';

  let selectedCategories = [];

  const onReady = () => {
    useRoute({
      componentId: 'games',
      routeId: $page.gameId,
      payload: {
        selectedCategories
      }
    });
  };

  const onSelectAll = () => {
    selectedCategories = $page.categories.map(cat => cat.categoryId);
  };
</script>

<div class="pre-game">
  <Button text="выбрать все" on:click={onSelectAll} />
  <List bind:linked={selectedCategories} list={$page.categories} />
  <Button text="готово" on:click={onReady} />
</div>

<style>
  .pre-game :global(.button) {
    margin-top: 10px;
  }
</style>
