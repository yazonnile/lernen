<script>
  import Button from 'sdk/button/button.svelte';
  import Login from './auth-login.svelte';
  import Registration from './auth-registration.svelte';
  import Buttons from 'sdk/bottom-buttons/bottom-buttons.svelte';

  let regMode = false;
</script>

<div class="form-auth">
  <Buttons>
    <Button on:click="{() => (regMode = !regMode)}" text={regMode ? 'Вход' : 'Регистрация'} />
  </Buttons>
  {#if !regMode}
    <Login />
  {:else}
    <Registration on:done={() => (regMode = false)} />
  {/if}
</div>
