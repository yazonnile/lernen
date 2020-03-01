<script>
  import Word from './word.svelte';
  import { page } from 'stores';
</script>

<Word
  word={$page.word}
  linkedCategories={$page.linkedCategories}
/>
