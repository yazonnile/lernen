<script>
  import Category from 'sdk/category/category.svelte';
  import FormBox from 'sdk/form-box/form-box.svelte';
  import Button from 'sdk/button/button.svelte';
  import { view, categories, games } from 'stores';

  let { gameId } = $view.params;
  let categoriesList;
  $: categoriesList = Object.values($categories);
  let selectedCategories = $games[gameId].categories.selected || [];
  let nullCategory = $games[gameId].categories.nullCategory || false;
  let selectedState = false;
  $: selectedState = nullCategory && selectedCategories.length === categoriesList.length;

  const onReady = () => {
    if (view[gameId + 'Game']) {
      $games[gameId].categories = {
        selected: selectedCategories,
        nullCategory
      };

      view[gameId + 'Game']();
    }
  };

  const onToggleAll = () => {
    if (selectedState) {
      selectedCategories = [];
    } else {
      selectedCategories = categories.getIds();
    }

    selectedState = !selectedState;
  };

  $: {
    if (!selectedCategories.length) {
      nullCategory = true;
    }
  }
</script>

<div class="pre-game">
  {#if categoriesList.length}
    <Button text={`${selectedState ? 'убрать' : 'выбрать'} все`} on:click={onToggleAll} />

    <FormBox>
      {#each categoriesList as { categoryName, categoryId } (categoryId)}
        <Category {categoryName}>
          <input type="checkbox" bind:group={selectedCategories} value={categoryId} />
        </Category>
      {/each}

      <Category categoryName="без категории">
        <input type="checkbox" bind:checked={nullCategory} />
      </Category>
    </FormBox>
  {/if}
  <div class="row">
    <Button text="играть" on:click={onReady} />
  </div>
</div>

<style>
  .row {
    margin-top: 20px;
  }
</style>
