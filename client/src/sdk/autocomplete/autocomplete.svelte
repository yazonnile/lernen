<script>
  export let result;
  export let value = '';
  export let label = null;

  import FormBox from 'sdk/form-box/form-box.svelte';
  import FormInput from 'sdk/form-input/form-input.svelte';
  import { words } from 'stores';

  $: {
    result = value && value.length ? Object.values($words).filter(word => {
      return word.original.toString().toLowerCase().indexOf(value.toLowerCase()) > -1;
    }).map(word => word.wordId) : null;
  }
</script>

<FormBox title={label}>
  <FormInput>
    <input type="text" bind:value placeholder="Brot" />
  </FormInput>
</FormBox>
