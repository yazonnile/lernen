<script>
  import Icon from 'sdk/icon/icon.svelte';
  import FormBox from 'sdk/form-box/form-box.svelte';
  import { categories as categoriesStore, words as wordsStore } from 'stores';
  import { afterUpdate } from 'svelte';

  let clickedWord = [];
  let collapsed = [];
  let categoryToEdit = null;
  let editableNode;
  let categoriesList;
  $: categoriesList = $wordsStore && Object.values($categoriesStore).map(category => {
    return {
      ...category,
      words: wordsStore.getWordsByCategoryId(category.categoryId)
    };
  });

  const onEdit = (categoryId) => {
    categoryToEdit = categoryId;
  };

  const onSave = (categoryId) => {
    const newCategoryName = editableNode.textContent;
    const existedCatyName = categoriesList.find(c => c.categoryName === newCategoryName);

    if (!existedCatyName && newCategoryName.length <= 100) {
      categoriesStore.updateCategory({
        categoryId, categoryName: newCategoryName
      });
    }

    onCancel();
  };

  const onCancel = () => {
    categoryToEdit = editableNode = null;
  };

  const onDelete = (categoryId) => {
    if (confirm('Удалить категорию?')) {
      wordsStore.deleteCategoryIdFromWords(categoryId);
      categoriesStore.deleteCategory(categoryId);
    }
  };

  const onClick = (categoryId) => {
    if (collapsed.includes(categoryId)) {
      collapsed.splice(collapsed.indexOf(categoryId), 1);
    } else {
      collapsed.push(categoryId);
    }

    collapsed = [...collapsed];
  };

  const onUnChain = (categoryId, wordId) => {
    if (clickedWord[0] === categoryId && clickedWord[1] === wordId) {
      wordsStore.unChainWordWithCategoryId(wordId, categoryId);
    } else if (categoryId && wordId) {
      clickedWord = [categoryId, wordId];
    } else {
      clickedWord = [];
    }
  };

  const selectText = () => {
    if (editableNode && document.activeElement !== editableNode) {
      editableNode.focus();

      const range = document.createRange();
      range.selectNodeContents(editableNode);
      range.collapse();
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  afterUpdate(selectText);
</script>

{#each categoriesList as { categoryName, categoryId, words } (categoryId)}
  <FormBox title={categoryName}>
    <div slot="title" class="slot-title">
      {#if categoryId === categoryToEdit}
        <h2 bind:this={editableNode} contenteditable>{categoryName}</h2>
      {:else}
        <h2>{categoryName}</h2>
      {/if}
    </div>

    <div slot="title-control" class="title-control">
      {#if categoryId === categoryToEdit}
        <button on:click|stopPropagation={onCancel}><Icon name="turnOff" /></button>
        <button on:click|stopPropagation={() => onSave(categoryId)}><Icon name="checkbox" /></button>
      {:else}
        <button on:click|stopPropagation={() => onEdit(categoryId)}><Icon name="edit" /></button>
        <button on:click|stopPropagation={() => onDelete(categoryId)}><Icon name="delete" /></button>
      {/if}

    </div>
    {#each words as wordId (wordId)}
      <div class="word">
        <div class="word--text">
          {$wordsStore[wordId].original}
        </div>

        <div class="buttons">
          {#if clickedWord[0] === categoryId && clickedWord[1] === wordId}
            <button class="button" on:click={() => onUnChain(categoryId, wordId)}><Icon name="delete" /></button>
            <button class="button" on:click={() => onUnChain()}>
              <Icon name="turnOff" />
            </button>
          {:else}
            <button class="button" on:click={() => onUnChain(categoryId, wordId)}>
              <Icon name="unchain" />
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </FormBox>
{:else}
  нет категорий
{/each}

<style>
  .slot-title {
    overflow: hidden;
  }

  .title-control {
    display: flex;
    flex: 1;
    flex-wrap: nowrap;
    margin: 0 -10px 0 0;
    padding-bottom: 5px;
  }

  .title-control button {
    background: none;
    border: 0;
    margin-left: 10px;
  }

  .title-control :global(.icon) {
    height: 20px;
    width: 20px;
  }

  .word {
    align-items: center;
    background: none;
    display: flex;
    flex-wrap: nowrap;
    line-height: 20px;
    text-align: left;
    width: 100%;
  }

  .word--text {
    flex: 1;
    overflow: hidden;
    padding: 5px 0 6px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .buttons {
    display: flex;
    flex-wrap: nowrap;
    margin-right: -5px;
  }

  .button {
    background: none;
    border: 0;
    flex: 0 0 24px;
    height: 24px;
    margin-left: 5px;
    width: 24px;
  }
</style>
