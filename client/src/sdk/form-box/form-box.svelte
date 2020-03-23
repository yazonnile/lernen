<script>
  export let title = '';

  const use = (node) => {
    if (title) {
      node.setAttribute('id', title);
    }
  }
</script>

<div class="box" use:use>
  {#if title}
    <div class="title">
      <slot name="title"><h2>{title}</h2></slot>
      <slot name="title-control" />
    </div>
  {/if}

  <div class="wrap"><slot /></div>
</div>

<style>
  .box {
    margin: 20px -10px 0;
    padding: 0 20px;
  }

  .box:first-child {
    margin-top: 0;
  }

  .box:last-child {
    margin-bottom: 0;
  }

  .title {
    align-items: flex-end;
    display: flex;
    flex-wrap: nowrap;
  }

  .title :global(h2) {
    font-size: 12px;
    font-weight: normal;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .wrap {
    background: var(--gameStandardBg);
    border: solid var(--gameStandardBgContrast);
    border-width: 1px 0;
    margin: 0 -20px;
    padding: 0 0 0 20px;
  }

  :global(.app--standard) .wrap { background: var(--gameStandardBg); border-color: var(--gameStandardBgContrast); }
  :global(.app--translationFirst) .wrap { background: var(--gameTranslationFirstBg); border-color: var(--gameTranslationFirstContrast); }
  :global(.app--articles) .wrap { background: var(--gameArticlesBg); border-color: var(--gameArticlesContrast); }
  :global(.app--plural) .wrap { background: var(--gamePluralBg); border-color: var(--gamePluralContrast); }
  :global(.app--spelling) .wrap { background: var(--gameSpellingBg); border-color: var(--gameSpellingContrast); }

  .wrap > :global(*) {
    border-top: 1px solid var(--gameStandardBgContrast);
    padding: 5px 15px 5px 0;
    flex: 1;
  }

  :global(.app--standard) .wrap > :global(*) { border-color: var(--gameStandardBgContrast); }
  :global(.app--translationFirst) .wrap > :global(*) { border-color: var(--gameTranslationFirstContrast); }
  :global(.app--articles) .wrap > :global(*) { border-color: var(--gameArticlesContrast); }
  :global(.app--plural) .wrap > :global(*) { border-color: var(--gamePluralContrast); }
  :global(.app--spelling) .wrap > :global(*) { border-color: var(--gameSpellingContrast); }

  .wrap > :global(*):first-child {
    border: 0;
  }
</style>

