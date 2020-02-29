<script>
  export let className = '';
  export let twoInARow = false;
</script>

<div class="buttons-row {className || ''}" class:two-in-a-row={twoInARow}>
  <slot />
</div>

<style>
  .buttons-row {
    border: 1px solid #fff;
    border-radius: 5px;
    display: flex;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .buttons-row :global(button) {
    background: var(--mainColorLight);
    border: solid var(--mainColorBorder);
    border-width: 0 0 0 1px;
    flex: 1;
    font-size: 12px;
    line-height: 14px;
    padding: 15px 5px;
    text-align: center;
    text-transform: uppercase;
  }

  .buttons-row :global(button):first-child {
    border: 0;
  }

  .buttons-row :global(button.active) {
    background: var(--mainColor);
    color: #fff;
  }

  .buttons-row.two-in-a-row {
    flex-wrap: wrap;
  }

  .buttons-row.two-in-a-row :global(button) {
    border: 0;
    flex: 1 0 50%;
  }

  .buttons-row.two-in-a-row :global(button):nth-child(2n) {
    border-left: 1px solid var(--mainColorBorder);
  }

  .buttons-row.two-in-a-row :global(button):nth-child(2n + 3),
  .buttons-row.two-in-a-row :global(button):nth-child(2n + 4){
    border-top: 1px solid var(--mainColorBorder);
  }
</style>
