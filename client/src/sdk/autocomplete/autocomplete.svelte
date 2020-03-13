<script>
  export let data;
  export let result;
  export let value = '';
  export let label = null;

  import FormElement from 'sdk/form-element/form-element.svelte';

  $: {
    result = value && value.length ? data.filter(word => {
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

<FormElement {label}>
  <input type="text" bind:value />
</FormElement>
