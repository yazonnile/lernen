<script>
  import Word from './word.svelte';
  import Page from 'sdk/page/page.svelte';
  import { view, words } from 'stores';
</script>

<Page>
  <Word word={$words[$view.params.wordId]} />
</Page>
