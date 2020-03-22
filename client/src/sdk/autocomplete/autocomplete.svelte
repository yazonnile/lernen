<script>
  export let result;
  export let value = '';
  export let label = null;

  import FormInput from 'sdk/form-input/form-input.svelte';
  import { words } from 'stores';

  $: {
    result = value && value.length > 1 ? Object.values($words).filter(word => {
      return word.original.toString().toLowerCase().indexOf(value.toLowerCase()) > -1;
    }).sort((a, b) => {
      a = a.original.toLowerCase();
      b = b.original.toLowerCase();

      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    }).map(word => word.wordId) : [];
  }
</script>

<FormInput {label}>
  <input type="text" bind:value />
</FormInput>
