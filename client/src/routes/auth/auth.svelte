<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import Button from 'sdk/button/button.svelte';
  import PasswordRecovery from './auth-password-recovery.svelte';
  import Login from './auth-login.svelte';
  import Registration from './auth-registration.svelte';
  import Buttons from 'sdk/bottom-buttons/bottom-buttons.svelte';

  let authMode = 'login';
</script>

<DocumentTitle title="Авторизация" />

<div class="form-auth">
  <Buttons>
    <div class="bottom-buttons">
      {#if authMode !== 'login'}<Button on:click="{() => (authMode = 'login')}" text="Вход" />{/if}
      {#if authMode !== 'register'}<Button on:click="{() => (authMode = 'register')}" text="Регистрация" />{/if}
      {#if authMode !== 'recovery'}<Button on:click="{() => (authMode = 'recovery')}" text="Сброс пароля" />{/if}
    </div>
  </Buttons>
  {#if authMode === 'login'}
    <Login />
  {:else if authMode === 'register'}
    <Registration bind:authMode />
  {:else}
    <PasswordRecovery />
  {/if}
</div>
