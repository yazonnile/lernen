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
    align-items: center;
    display: flex;
    position: relative;
  }

  .item {
    border-radius: 5px;
    cursor: pointer;
    display: block;
    flex: 1;
    font-size: 12px;
    line-height: 16px;
    overflow: hidden;
    padding: 8px 5px 7px 0;
    user-select: none;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  label :global(.icon) {
    color: var(--blueContrast);
    flex: 0 0 20px;
    height: 20px;
    opacity: .5;
    padding: 4px;
    transition: padding .15s ease-in-out;
  }

  label :global(input:checked) ~ :global(.icon) {
    color: inherit;
    opacity: 1;
    padding: 0;
  }

  :global(input:checked) + .item {

  }

  label :global(input) {
    position: absolute;
    visibility: hidden;
  }
</style>
