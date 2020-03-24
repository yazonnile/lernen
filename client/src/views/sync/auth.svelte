<script>
  import { loadInitialData } from 'api/load-initial-data/load-initial-data';
  import LampRow from 'sdk/lamp-row/lamp-row.svelte';
  import FormBox from 'sdk/form-box/form-box.svelte';
  import FormInput from 'sdk/form-input/form-input.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation'
  import request from 'lib/request/request';
  import Button from 'sdk/button/button.svelte';
  import { view } from 'stores';

  let authMode = 1;
  const lampItems = [
    { id: 1, text: 'вход' },
    { id: 2, text: 'регистрация' }
  ];

  const callback = (values) => {
    if (authMode === 2) {
      request({ api: 'registerUser', payload: values }).then(response => {
        if (response) {
          $pValue = '';
          authMode = 1;
        }
      });
    } else {
      loadInitialData({
        callback: () => {
          view.home();
        },
        loginAttempt: true,
        payload: {
          login: values
        }
      });
    }
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

<div class="form-auth">
  <p class="error">Войдите в свой аккаунт, чтобы не потерять свои слова</p>
  <div class="row">
    <LampRow value={authMode} items={lampItems} on:select={({ detail }) => ( authMode = detail )} />
  </div>

  <FormValidation {form}>
    <div class="row">
      <FormBox title={authMode === 2 ? 'Регистрация' : 'Вход'}>
        <FormInput errors={lErrors} label="Логин">
          <input type="text" bind:value={$lValue} use:lInput />
        </FormInput>
        <FormInput errors={pErrors} label="Пароль">
          <input type="password" bind:value={$pValue} use:pInput />
        </FormInput>
        {#if authMode === 2}
          <FormInput errors={mErrors} label="Сложите eins и четыре">
            <input type="number" bind:value={$mValue} use:mInput />
          </FormInput>
        {/if}
      </FormBox>
    </div>
    <div class="row">
      <Button text={authMode === 2 ? 'Создать пользователя' : 'Войти'} type="submit" />
    </div>
  </FormValidation>
</div>

<style>
  .error {
    color: var(--redColor);
  }

  .row {
    margin-top: 20px;
  }
</style>
