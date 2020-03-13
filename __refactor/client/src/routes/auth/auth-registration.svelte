<script>
  export let authMode;

  import FormElement from 'sdk/form-element/form-element.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation'

  let {
    entries: {
      login: [ lErrors, lValue, lInput ],
      email: [ eErrors, eValue, eInput ],
      password: [ pErrors, pValue, pInput ],
      mcnulty: [ mErrors, mValue, mInput ],
    },
    form
  } = createValidation({ componentId: 'auth', routeId: 'registerUser' }, () => {
    authMode = 'login';
  });
</script>

<FormValidation {form}>
  <h1>Регистрация</h1>
  <FormElement errors={lErrors} label="Логин">
    <input type="text" bind:value={$lValue} use:lInput />
  </FormElement>
  <FormElement errors={eErrors} label="Email">
    <input type="email" bind:value={$eValue} use:eInput />
  </FormElement>
  <FormElement errors={pErrors} label="Пароль">
    <input type="password" bind:value={$pValue} use:pInput />
  </FormElement>
  <FormElement errors={mErrors} label="Сложите eins и четыре">
    <input type="number" bind:value={$mValue} use:mInput />
  </FormElement>
  <Button text="Готово" type="submit" />
</FormValidation>
