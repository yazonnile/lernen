<script>
  import FormElement from 'sdk/form-element/form-element.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation';
  import { useRoute } from 'lib/router/router';
  import { user, words, setup, games, categories } from 'stores';

  const {
    entries: {
      loginOrEmail: [ lErrors, lValue, lInput ],
      password: [ pErrors, pValue, pInput ],
    },
    form
  } = createValidation({ componentId: 'auth', routeId: 'login' }, ({ initialData }) => {
    if ($user.userId) {
      words.set(initialData.words);
      setup.set(initialData.setup);
      games.set(initialData.games);
      categories.set(initialData.categories);
      useRoute({ componentId: 'home' });
    }
  });
</script>

<FormValidation {form}>
  <h1>Вход</h1>
  <FormElement errors={lErrors} label="Логин или Email">
    <input type="text" bind:value={$lValue} use:lInput />
  </FormElement>
  <FormElement errors={pErrors} label="Пароль">
    <input type="password" bind:value={$pValue} use:pInput />
  </FormElement>
  <Button text="Войти" type="submit" />
</FormValidation>
