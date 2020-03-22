<script>
  export let title = '';
</script>

<div class="box">
  {#if title}
    <h2 class="title">{title}</h2>
  {/if}

  <div class="wrap">
    <slot />
  </div>
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
    font-size: 12px;
    font-weight: normal;
    line-height: 20px;
    text-transform: uppercase;
  }

  .wrap {
    background: var(--gameStandardBg);
    border: solid var(--blueContrast);
    border-width: 1px 0;
    margin: 0 -20px;
    padding: 0 0 0 20px;
  }

  .wrap > :global(*) {
    border-top: 1px solid var(--blueContrast);
    padding: 5px 15px 5px 0;
    flex: 1;
  }

  .wrap > :global(*):first-child {
    border: 0;
  }
</style>
