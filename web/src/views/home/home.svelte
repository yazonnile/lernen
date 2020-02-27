<script>
  import Button from 'sdk/button/button.svelte';
  import { view } from 'stores';
</script>

<div class="home">
  <Button text="Учить" on:click={view.learn} />
  <Button text="Добавить слово" on:click={view.add} />
</div>

<style>
  .home :global(.button) {
    margin-top: 50px;
    width: 100%;
  }
</style>
