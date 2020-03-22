<script>
  export let title;
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
    background: var(--gameStandardBg);
    margin: 25px 0;
    padding: 20px;
  }

  .box:last-child {
    margin-bottom: 0;
  }

  .title {
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wrap > :global(*) {
    flex: 1;
  }
</style>
