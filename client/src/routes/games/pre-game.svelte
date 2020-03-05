<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import Category from 'sdk/category/category.svelte';
  import Button from 'sdk/button/button.svelte';
  import Fly from 'sdk/transition/fly.svelte';
  import { useRoute } from 'lib/router/router';
  import { page, categories as categoriesStore, games } from 'stores';

  let { gameName } = $page.activeRoute.params;
  let categories = Object.values($categoriesStore);
  let selectedCategories = [];
  let nullCategory = false;
  let selectedState = false;
  $: selectedState = nullCategory && selectedCategories.length === categories.length;

  const onReady = () => {
    $games[gameName].categories = {
      selectedCategories,
      nullCategory
    };

    useRoute({
      componentId: 'games',
      routeId: gameName
    });
  };

  const onToggleAll = () => {
    if (selectedState) {
      selectedCategories = [];
      nullCategory = false;
    } else {
      selectedCategories = categoriesStore.getIds();
      nullCategory = true;
    }

    selectedState = !selectedState;
  };
</script>

<DocumentTitle title="Выбор категорий" />

<div class="pre-game">
  {#if categories.length}
    <Button text={`${selectedState ? 'убрать' : 'выбрать'} все`} on:click={onToggleAll} />

    {#each categories as { categoryName, categoryId } (categoryId)}
      <Category {categoryName}>
        <input type="checkbox" bind:group={selectedCategories} value={categoryId} />
      </Category>
    {/each}

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
