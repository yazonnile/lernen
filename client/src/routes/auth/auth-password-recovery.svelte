<script>
  import FormElement from 'sdk/form-element/form-element.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation'

  const {
    entries: {
      loginOrEmail: [ errors, value, input ]
    },
    form
  } = createValidation({ componentId: 'auth', routeId: 'askForPasswordRecovery' }, (data) => {
    console.log('askForPasswordRecovery CALLBACK', data);
  });
</script>

<FormValidation {form}>
  <h1>Сброс пароля</h1>
  <FormElement {errors} label="Логин или Email">
    <input type="text" bind:value={$value} use:input />
  </FormElement>
  <Button text="Сбросить" type="submit" />
</FormValidation>
