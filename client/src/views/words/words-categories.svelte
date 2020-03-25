<script>
  export let linked;
  export let active;

  import Category from 'sdk/category/category.svelte';
  import FormInput from 'sdk/form-input/form-input.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Icon from 'sdk/icon/icon.svelte';
  import FormBox from 'sdk/form-box/form-box.svelte';
  import { categories as categoriesStore } from 'stores';

  let categories;
  $: categories = Object.values($categoriesStore);
  let formView = false;
  let newCategoryName = '';

  const onCategoryAdd = () => {
    if (!newCategoryName) {
      return;
    }

    newCategoryName = newCategoryName.toLowerCase();
    if (newCategoryName.length > 100 || categories.find(c => c.categoryName === newCategoryName)) {
      return;
    }

    const newCat = { categoryName: newCategoryName };
    categoriesStore.updateCategory(newCat);
    linked = [...linked, categoriesStore.getCategoryIdByName(newCategoryName)];
    newCategoryName = '';
    formView = false;
  };
</script>

<FormBox>
  <FormSwitcher type="toggle" bind:checked={active}>Добавить слово в категорию</FormSwitcher>
</FormBox>
{#if active}
  <FormBox title="добавить слово в категории">
    {#each categories as { categoryName, categoryId } (categoryId)}
      <Category {categoryName}>
        <input type="checkbox" bind:group={linked} value={categoryId} />
      </Category>
    {/each}

    <FormInput>
      <input type="text" bind:value={newCategoryName} placeholder="Имя категории" />

      <div class="button" on:click={onCategoryAdd}>
        <Icon name="plus" />
      </div>
    </FormInput>
  </FormBox>
{/if}

<style>
  .button {
    flex: 0 0 31px;
    height: 31px;
    margin-right: -6px;
    padding: 6px 6px 5px 5px;
    width: 31px;
  }
</style>
