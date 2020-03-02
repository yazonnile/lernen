<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import { useRoute } from 'lib/router/router';

  const onGame = (gameName) => {
    useRoute({ componentId: 'games', routeId: 'preGame', params: { gameName } });
  }
</script>

<DocumentTitle title="Список игр" />

<div class="home">
  <button class="game" on:click={() => onGame('learn')}>
    учить
  </button>
</div>

<style>
  .game {
    background: var(--mainColorLight);
    box-shadow: 0 0 2px #000;
    font-size: 19px;
    letter-spacing: 1px;
    line-height: 27px;
    border-radius: 5px;
    padding: 20px;
    text-transform: uppercase;
    width: 100%;
  }
</style>
