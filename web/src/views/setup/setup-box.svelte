<script>
  export let title;
</script>

<div class="box">
  {#if title}
    <span class="title">{title}</span>
  {/if}

  <slot></slot>
</div>

<style>
  .box {
    border: 1px dashed var(--mainColor);
    margin-bottom: 40px;
    padding: 30px 5px 0;
    position: relative;
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
</style>
