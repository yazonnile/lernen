<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import List from 'sdk/categories/categories-list.svelte';
  import Category from 'sdk/category/category.svelte';
  import Button from 'sdk/button/button.svelte';
  import Fly from 'sdk/transition/fly.svelte';
  import { useRoute } from 'lib/router/router';
  import { page } from 'stores';

  let selectedCategories = [];
  let nullCategory = false;
  let selectedState = false;
  $: selectedState = nullCategory && selectedCategories.length === $page.categories.length;

  const onReady = () => {
    useRoute({
      componentId: 'games',
      routeId: $page.activeRoute.params.gameName,
      payload: {
        selectedCategories,
        nullCategory
      }
    });
  };

  const onToggleAll = () => {
    if (selectedState) {
      selectedCategories = [];
      nullCategory = false;
    } else {
      selectedCategories = $page.categories.map(cat => cat.categoryId);
      nullCategory = true;
    }

    selectedState = !selectedState;
  };
</script>

<DocumentTitle title="Выбор категорий" />

<div class="pre-game">
  {#if $page.categories.length}
    <Button text={`${selectedState ? 'убрать' : 'выбрать'} все`} on:click={onToggleAll} />
    <List bind:linked={selectedCategories} list={$page.categories} />
    <Fly active={selectedCategories.length}>
      <Category categoryName="без категории">
        <input type="checkbox" bind:checked={nullCategory} />
      </Category>
    </Fly>
  {/if}
  <Button text="играть" on:click={onReady} />
</div>

<style>
  .pre-game :global(.button) {
    margin-top: 10px;
  }
</style>
