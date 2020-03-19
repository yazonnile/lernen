<script>
  import Icon from 'sdk/icon/icon.svelte';
  import Slide from 'sdk/transition/slide.svelte'
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
    } else {
      clickedWord = [categoryId, wordId];
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

<div class="cats">
  {#each categoriesList as { categoryName, categoryId, words } (categoryId)}
    <h2
      class="category"
      class:collapsed={collapsed.includes(categoryId)}
      on:click={() => onClick(categoryId)}
    >
      {#if categoryId === categoryToEdit}
        <span
          contenteditable
          bind:this={editableNode}
          on:click|stopPropagation
        >{categoryName}</span>
      {:else}
        {categoryName}
      {/if}

      <div class="buttons">
        {#if categoryId === categoryToEdit}
          <button on:click|stopPropagation={() => onSave(categoryId)}><Icon name="checkbox" /></button>
          <button on:click|stopPropagation={onCancel}><Icon name="turn-off" /></button>
        {:else}
          <button on:click|stopPropagation={() => onEdit(categoryId)}><Icon name="edit" /></button>
        {/if}

        <button on:click|stopPropagation={() => onDelete(categoryId)}><Icon name="delete" /></button>
      </div>
    </h2>
    <Slide active={!collapsed.includes(categoryId)}>
      <div class="words-block">
        {#each words as wordId (wordId)}
          {#if clickedWord[0] === categoryId && clickedWord[1] === wordId}
            <div class="suggestion" on:click={() => (clickedWord = [])}>Чтобы удалить слово из категории нажмите по нему еще раз. Чтобы отменить удаление - нажмите на это сообщение</div>
          {/if}

          <button on:click={() => onUnChain(categoryId, wordId)} class="word">
            {$wordsStore[wordId].original}
            <Icon name="unchain" />
          </button>
        {/each}
      </div>
    </Slide>
  {/each}
</div>

<style>
  .cats {

  }

  .category {
    background: var(--categoryActiveColor);
    border: 1px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    font-size: 12px;
    font-weight: normal;
    line-height: 16px;
    margin-top: 20px;
    padding: 7px 10px;
    user-select: none;
    text-transform: uppercase;
  }

  .category:first-child {
    margin-top: 0;
  }

  .category::before {
    content: '-';
    display: inline-block;
    font-size: 15px;
    margin-top: -1px;
    padding-right: 10px;
    text-align: center;
    vertical-align: top;
    width: 22px;
  }

  .collapsed::before {
    content: '+';
  }

  .category .buttons {
    float: right;
    margin: -4px -7px -4px 5px;
  }

  .category button {
    background: var(--categoryColor);
    border: 0;
    border-radius: 5px;
    margin-left: 3px;
    padding: 2px;
  }

  .category :global(.icon) {
    height: 20px;
    width: 20px;
  }

  .words-block {
    padding: 0 0 5px 30px;
    position: relative;
  }

  .words-block:empty {
    padding-bottom: 0;
  }

  .words-block::before {
    background: var(--mainColor);
    content: '';
    height: calc(100% - 12px);
    left: 15px;
    position: absolute;
    top: -6px;
    width: 1px;
  }

  .word {
    background: none;
    border: 1px solid var(--mainColor);
    border-radius: 5px;
    display: block;
    line-height: 20px;
    margin-top: 5px;
    padding: 2px 5px;
    position: relative;
    text-align: left;
    width: 100%;
  }

  .word::before {
    background: var(--mainColor);
    content: '';
    height: 1px;
    left: -16px;
    position: absolute;
    top: 11px;
    width: 16px;
  }

  .word :global(.icon) {
    float: right;
    height: 20px;
    margin-left: 5px;
    width: 20px;
  }

  .suggestion {
    color: var(--redColor);
    padding-top: 20px;
  }

  .suggestion:first-child {
    padding-top: 5px;
  }

  .suggestion + .word {
    background: var(--redColorLight);
    margin-bottom: 20px;
  }

  .suggestion + .word:last-child {
    margin-bottom: 0;
  }
</style>
