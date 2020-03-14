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
    background: var(--categoryColor);
    border: 1px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    font-size: 12px;
    line-height: 15px;
    padding: 7px 10px 7px 33px;
    user-select: none;
    text-transform: uppercase;
  }

  label :global(.icon) {
    color: #ddd;
    height: 16px;
    position: absolute;
    left: 9px;
    transition: all .15s ease-in-out;
    top: 8px;
    width: 16px;
  }

  label :global(input:checked) ~ :global(.icon) {
    color: inherit;
    height: 20px;
    left: 7px;
    top: 5px;
    width: 20px;
  }

  :global(input:checked) + .item {
    background: var(--categoryActiveColor);
  }

  label :global(input) {
    position: absolute;
    visibility: hidden;
  }
</style>
