<script>
  import Button from 'sdk/button/button.svelte';
  import Login from './auth-login.svelte';
  import Registration from './auth-registration.svelte';
  import Buttons from 'sdk/bottom-buttons/bottom-buttons.svelte';

  let authMode = 'login';
</script>

<div class="form-auth">
  <Buttons>
    {#if authMode !== 'login'}<Button on:click="{() => (authMode = 'login')}" text="Вход" />{/if}
    {#if authMode !== 'register'}<Button on:click="{() => (authMode = 'register')}" text="Регистрация" />{/if}
  </Buttons>
  {#if authMode === 'login'}
    <Login />
  {:else}
    <Registration bind:authMode />
  {/if}
</div>
