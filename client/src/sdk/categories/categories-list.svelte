<script>
  export let linked;
  export let list;

  import Category from 'sdk/category/category.svelte';
</script>

{#each list as { categoryName, categoryId } (categoryId)}
  <Category {categoryName}>
    <input type="checkbox" bind:group={linked} value={categoryId} />
  </Category>
{/each}
