<script>
  import Category from 'sdk/category/category.svelte';
  import Page from 'sdk/page/page.svelte';
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
    if (view[gameId]) {
      $games[gameId].categories = {
        selected: selectedCategories,
        nullCategory
      };

      view[gameId]();
    }
  };

  const onToggleAll = () => {
    if (selectedState) {
      selectedCategories = [];
    } else {
      selectedCategories = categories.getIds();
      nullCategory = true;
    }

    selectedState = !selectedState;
  };

  $: {
    if (!selectedCategories.length) {
      nullCategory = true;
    }
  }
</script>

<Page className="pre-game">
  {#if categoriesList.length}
    <Button text={`${selectedState ? 'убрать' : 'выбрать'} все`} on:click={onToggleAll} />
  {/if}

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

  <div class="row">
    <Button text="играть" on:click={onReady} />
  </div>
</Page>

<style>
  .row {
    margin-top: 20px;
  }
</style>
