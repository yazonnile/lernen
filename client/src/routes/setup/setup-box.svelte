<script>
  export let title;
  export let flex = false;
</script>

<div class="box" class:flex>
  {#if title}
    <span class="title">{title}</span>
  {/if}

  <div class="wrap">
    <slot />
  </div>
</div>

<style>
  .box {
    border: 1px dashed var(--mainColor);
    margin: 25px 0;
    padding: 30px 20px 0;
    position: relative;
  }

  .flex {
    padding: 20px 10px 10px;
  }

  .flex .wrap {
    display: flex;
    margin-right: -10px;
  }

  .title {
    background: #fff;
    font-size: 16px;
    line-height: 20px;
    left: 10px;
    padding: 2px 5px;
    position: absolute;
    top: -14px;
  }

  .wrap > :global(*) {
    flex: 1;
  }
</style>
