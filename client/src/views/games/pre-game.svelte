<script>
  import Category from 'sdk/category/category.svelte';
  import Button from 'sdk/button/button.svelte';
  import Fly from 'sdk/transition/fly.svelte';
  import { view, categories as categoriesStore, games } from 'stores';

  let { gameId } = $view.params;
  let categories = Object.values($categoriesStore);
  let selectedCategories = $games[gameId].categories.selected || [];
  let nullCategory = $games[gameId].categories.nullCategory || false;
  let selectedState = false;
  $: selectedState = nullCategory && selectedCategories.length === categories.length;

  const onReady = () => {
    $games[gameId].categories = {
      selected: selectedCategories,
      nullCategory
    };

    // useRoute({
    //   componentId: 'games',
    //   routeId: gameId
    // });
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
