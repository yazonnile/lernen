<script>
  export let linked;
  export let active;

  import Category from 'sdk/category/category.svelte';
  import FormInput from 'sdk/form-input/form-input.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Button from 'sdk/button/button.svelte';
  import Slide from 'sdk/transition/slide.svelte'
  import { categories as categoriesStore } from 'stores';

  let categories;
  $: categories = Object.values($categoriesStore);
  let formView = false;
  let newCategoryName = '';
  let tmpId = -999; // TODO: SYNC

  const onCategoryAdd = () => {
    if (!newCategoryName) {
      return;
    }

    newCategoryName = newCategoryName.toLowerCase();
    const existedCatyName = categories.find(c => c.categoryName === newCategoryName);

    if (!existedCatyName) {
      const newCat = { categoryName: newCategoryName, categoryId: tmpId++ }; // TODO: SYNC
      categoriesStore.createCategory(newCat);
      linked = [...linked, newCat.categoryId];
    } else if (linked.indexOf(existedCatyName.categoryId) === -1) {
      linked = [...linked, existedCatyName.categoryId];
    }

    newCategoryName = '';
    formView = false;
  };
</script>

<div class="wrap" class:active>

  <FormSwitcher type="toggle" bind:checked={active}>Добавить слово в категорию</FormSwitcher>

  <Slide active={active}>
    {#if formView}
      <FormInput label="Имя категории">
        <input type="text" bind:value={newCategoryName} />
      </FormInput>
      <div class="flex">
        <Button on:click={onCategoryAdd} text="создать" />
        <Button on:click={() => (formView = false)} text="отменить" />
      </div>
    {:else}
      <Button text="создать категорию" icon="plus" on:click={() => (formView = true)} />
    {/if}

    {#each categories as { categoryName, categoryId } (categoryId)}
      <Category {categoryName}>
        <input type="checkbox" bind:group={linked} value={categoryId} />
      </Category>
    {/each}
  </Slide>
</div>

<style>
  .wrap {
    border: dashed var(--mainColorLight);
    border-width: 1px 0;
    margin-bottom: 10px;
    padding: 20px 0;
  }

  .active {
    padding-bottom: 10px;
  }

  .wrap :global(.form-input) {
    margin: 10px 0 0;
  }

  .wrap :global(.form-switcher) {
    margin-bottom: 0;
  }

  .flex {
    display: flex;
    margin-right: -10px;
  }

  .wrap :global(.button) {
    margin-top: 10px;
  }
</style>
