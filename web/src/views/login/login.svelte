<script>
  import FormElement from 'sdk/form-element/form-element.svelte';
  import Button from 'sdk/button/button.svelte';
  import request from 'lib/request/request';
  import { data, setup, view } from 'stores';

  let login = '';
  let password = '';

  const onSubmit = () => {
    request('/login', { login, password }).then(responseData => {
      if (responseData && responseData.data) {
        $data = responseData.data.data;
        $setup = responseData.data.setup;
        view.home();
      }
    });
  };
</script>

<form class="login" on:submit|preventDefault={onSubmit}>
  <FormElement label="Логин">
    <input type="text" bind:value={login} />
  </FormElement>
  <FormElement label="Пароль">
    <input type="password" bind:value={password} />
  </FormElement>
  <Button type="submit" text="Войти" color="primary" />
</form>

<style>
  .login {
    width: 100%;
  }

  .login :global(.button) {
    width: 100%;
  }
</style>
