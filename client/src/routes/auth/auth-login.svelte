<script>
  import FormElement from 'sdk/form-element/form-element.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation';

  const {
    entries: {
      loginOrEmail: [ lErrors, lValue, lInput ],
      password: [ pErrors, pValue, pInput ],
    },
    form
  } = createValidation({ componentId: 'home' }, {
    scheme: ['loginOrEmail', 'password']
  });
</script>

<FormValidation {form}>
  <h1>Вход</h1>
  <FormElement errors={lErrors} label="Логин или Email">
    <input type="text" bind:value={$lValue} use:lInput />
  </FormElement>
  <FormElement errors={pErrors} label="Пароль">
    <input type="password" bind:value={$pValue} use:pInput />
  </FormElement>
  <Button text="Войти" type="submit" />
</FormValidation>
