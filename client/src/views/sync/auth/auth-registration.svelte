<script>
  import FormInput from 'sdk/form-input/form-input.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation'
  import request from 'lib/request/request';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const callback = (values) => {
    request({ api: 'registerUser', payload: values }).then(response => {
      if (response) {
        dispatch('done');
      }
    });
  };

  let {
    entries: {
      login: [ lErrors, lValue, lInput ],
      password: [ pErrors, pValue, pInput ],
      mcnulty: [ mErrors, mValue, mInput ],
    },
    form
  } = createValidation({
    scheme: ['login', 'password', 'mcnulty']
  }, callback);
</script>

<FormValidation {form}>
  <h1>Регистрация</h1>
  <FormInput errors={lErrors} label="Логин">
    <input type="text" bind:value={$lValue} use:lInput />
  </FormInput>
  <FormInput errors={pErrors} label="Пароль">
    <input type="password" bind:value={$pValue} use:pInput />
  </FormInput>
  <FormInput errors={mErrors} label="Сложите eins и четыре">
    <input type="number" bind:value={$mValue} use:mInput />
  </FormInput>
  <Button text="Готово" type="submit" />
</FormValidation>
