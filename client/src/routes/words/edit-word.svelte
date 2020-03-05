<script>
  import Word from './word.svelte';
  import { page, words } from 'stores';
</script>

<Word word={$words[$page.activeRoute.params.wordId]} />
