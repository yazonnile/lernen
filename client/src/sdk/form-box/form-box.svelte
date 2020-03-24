<script>
  export let title = '';

  const use = (node) => {
    if (title) {
      node.setAttribute('id', title);
    }
  }
</script>

<div class="form-box" use:use>
  {#if title}
    <div class="title">
      <slot name="title"><h2>{title}</h2></slot>
      <slot name="title-control" />
    </div>
  {/if}

  <div class="wrap"><slot /></div>
</div>

<style global>
  .form-box {
    margin: 20px -10px 0;
    padding: 0 20px;
  }

  .form-box:first-child {
    margin-top: 0;
  }

  .form-box:last-child {
    margin-bottom: 0;
  }

  .form-box .title {
    align-items: flex-end;
    display: flex;
    flex-wrap: nowrap;
  }

  .form-box .title :global(h2) {
    font-size: 12px;
    font-weight: normal;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .form-box .wrap {
    background: var(--gameStandardBg);
    border: solid var(--gameStandardBgContrast);
    border-width: 1px 0;
    margin: 0 -20px;
    padding: 0 0 0 20px;
  }

  .app--standard .form-box .wrap { background: var(--gameStandardBg); border-color: var(--gameStandardBgContrast); }
  .app--translationFirst .form-box .wrap { background: var(--gameTranslationFirstBg); border-color: var(--gameTranslationFirstContrast); }
  .app--articles .form-box .wrap { background: var(--gameArticlesBg); border-color: var(--gameArticlesContrast); }
  .app--plural .form-box .wrap { background: var(--gamePluralBg); border-color: var(--gamePluralContrast); }
  .app--spelling .form-box .wrap { background: var(--gameSpellingBg); border-color: var(--gameSpellingContrast); }

  .form-box .wrap > * {
    border-top: 1px solid var(--gameStandardBgContrast);
    padding: 5px 15px 5px 0;
    flex: 1;
  }

  .app--standard .form-box .wrap > * { border-color: var(--gameStandardBgContrast); }
  .app--translationFirst .form-box .wrap > * { border-color: var(--gameTranslationFirstContrast); }
  .app--articles .form-box .wrap > * { border-color: var(--gameArticlesContrast); }
  .app--plural .form-box .wrap > * { border-color: var(--gamePluralContrast); }
  .app--spelling .form-box .wrap > * { border-color: var(--gameSpellingContrast); }

  .form-box .wrap > *:first-child {
    border: 0;
  }
</style>

