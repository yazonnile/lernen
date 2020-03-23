<script>
  export let label = '';
  export let errors = null;
</script>

<label class="form-input" class:form-input--error={errors && $errors.length}>
  {#if label}
    <span class="label">{label}</span>
  {/if}
  <slot />
</label>

<style>
  .form-input {
    align-items: center;
    display: flex;
    flex-wrap: nowrap;
  }

  .label {
    flex: 0 0 100px;
    white-space: nowrap;
  }

  .form-input :global(input) {
    background: none;
    border: 0;
    flex: 1;
    font-size: 15px;
    margin-right: -5px;
    line-height: 21px;
    height: 31px;
    padding: 5px;
  }

  .form-input :global(input)::placeholder {
    color: var(--gameStandardBgContrast);
  }

  .form-input--error :global(input) {
    background: var(--buttonRedBg);
  }
</style>
