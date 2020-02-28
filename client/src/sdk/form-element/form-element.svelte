<script>
  export let label = '';
  export let errors = null;

  import Errors from './errors.svelte';
</script>

<span class="form-input">
  <label>
    {#if label}
      <span class="form-input--label">{label}</span>
    {/if}
    <slot />
  </label>
  {#if errors}
    <Errors {errors} />
  {/if}
</span>

<style>
  .form-input {
    display: block;
    margin-bottom: 20px;
    position: relative;
  }

  .form-input:last-child {
    margin-bottom: 0;
  }

  .form-input--label {
    display: inline-block;
    margin-bottom: 1px;
    vertical-align: top;
  }

  .form-input :global(input),
  .form-input :global(select) {
    background: #fff;
    border: solid #ccc;
    border-width: 1px 1px 3px;
    border-radius: 2px;
    color: #4b4b4b;
    display: block;
    font-size: 15px;
    line-height: 21px;
    height: 40px;
    padding: 7px 10px 8px;
    max-width: 100%;
    min-width: 100%;
    width: 100%;
  }

  .form-input :global(input):focus,
  .form-input :global(select):focus {
    border-color: var(--mainColorLight);
  }
</style>
