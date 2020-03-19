<script>
  import FormInput from 'sdk/form-input/form-input.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation'
  import { loadInitialData } from 'api/load-initial-data/load-initial-data';

  const callback = (values) => {
    loadInitialData({
      payload: {
        login: values
      }
    });
  };

  let {
    entries: {
      login: [ lErrors, lValue, lInput ],
      password: [ pErrors, pValue, pInput ],
    },
    form
  } = createValidation({
    scheme: ['login', 'password']
  }, callback);
</script>

<FormValidation {form}>
  <h1>Вход</h1>
  <FormInput errors={lErrors} label="Логин">
    <input type="text" bind:value={$lValue} use:lInput />
  </FormInput>
  <FormInput errors={pErrors} label="Пароль">
    <input type="password" bind:value={$pValue} use:pInput />
  </FormInput>
  <Button text="Войти" type="submit" />
</FormValidation>
