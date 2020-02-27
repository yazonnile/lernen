<script>
  export let keys;
  export let result;
  export let value = '';
  export let label = null;

  import FormElement from 'sdk/form-element/form-element.svelte';

  $: {
    result = value && value.length ? keys.filter(key => {
      return key.toString().toLowerCase().indexOf(value.toLowerCase()) > -1;
    }).sort((a, b) => {
      a = a.toLowerCase();
      b = b.toLowerCase();

      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    }) : [];
  }
</script>

<FormElement {label}>
  <input type="text" bind:value />
</FormElement>
