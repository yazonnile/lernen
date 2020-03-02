<script>
  export let categoryName;
  import Icon from 'sdk/icon/icon.svelte';
</script>

<label on:click>
  <slot />
  <span class="item">{categoryName}</span>
  <Icon name="checkbox" />
</label>

<style>
  label {
    display: block;
    margin-top: 10px;
    position: relative;
  }

  .item {
    background: #f7f7f7;
    border: 1px solid var(--mainColorLight);
    border-radius: 5px;
    display: block;
    font-size: 12px;
    line-height: 15px;
    padding: 7px 10px 7px 33px;
    text-transform: uppercase;
    transition: background-color .3s ease, color .3s ease;
  }

  label :global(.icon) {
    color: #ddd;
    height: 16px;
    position: absolute;
    left: 9px;
    top: 8px;
    width: 16px;
  }

  label :global(input:checked) ~ :global(.icon) {
    color: #fff;
    height: 20px;
    left: 7px;
    top: 5px;
    width: 20px;
  }

  :global(input:checked) + .item {
    background: var(--mainColor);
    color: #fff;
  }

  label :global(input) {
    position: absolute;
    visibility: hidden;
  }
</style>
