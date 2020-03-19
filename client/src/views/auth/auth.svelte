<script>
  import Button from 'sdk/button/button.svelte';
  import Login from './auth-login.svelte';
  import Registration from './auth-registration.svelte';

  let regMode = false;
</script>

<div class="form-auth">
  {#if !regMode}
    <Login />
  {:else}
    <Registration on:done={() => (regMode = false)} />
  {/if}
  <Button on:click="{() => (regMode = !regMode)}" text={regMode ? 'Вход' : 'Регистрация'} />
</div>
