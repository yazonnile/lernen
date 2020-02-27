<script>
  import Button from 'sdk/button/button.svelte';
  import { view } from 'stores';
</script>

<div class="home">
  <Button text="Учить" on:click={view.learn} />
  <Button text="Настроить" on:click={view.setup} />
  <Button text="Словарь" on:click={view.words} />
  <Button text="Добавить слово" on:click={view.add} />
</div>

<style>
  .home {
    width: 100%;
  }

  .home :global(.button) {
    margin-top: 10px;
  }
</style>
