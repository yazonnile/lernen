<script>
  import Word from './word.svelte';
  import { view, words } from 'stores';
</script>

<Word word={$words[$view.params.wordId]} />
