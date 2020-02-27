<script>
  import FormElement from 'sdk/form-element/form-element.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Button from 'sdk/button/button.svelte';
  import createValidation from 'svelidation';
  import request from 'lib/request/request';
  import { data } from 'stores';

  $: console.log($data);

  let type = 'word';
  let wordType = 'noun';
  let article = 'das';
  let strongVerb = false;

  const {
    createEntries,
    createForm,
  } = createValidation({
    clearErrorsOnEvents: null,
    presence: 'required',
    trim: true,
    useCustomErrorsStore: (errors, params) => {
      return errors.reduce((result, ruleName) => {
        result[ruleName] = params[ruleName];
        return result;
      }, {});
    },
  });

  const onSuccess = (values) => {
    request('/add', {
      ...Object.fromEntries(values.entries()),
      type, wordType, article, strongVerb
    }).then(responseData => {
      if (responseData && responseData.data) {
        data.add(responseData.data.key, responseData.data.data);
      }
    });
  };

  const getFieldParams = id => ({
    type: 'string',
    value: '',
    between: [1, 200],
    id
  });

  const [
    [textErrors, textValue, textInput],
    [translationErrors, translationValue, translationInput],
    [pluralErrors, pluralValue, pluralInput],
    [strong1Errors, strong1Value, strong1Input],
    [strong2Errors, strong2Value, strong2Input],
    [strong3Errors, strong3Value, strong3Input],
    [strong4Errors, strong4Value, strong4Input],
    [strong5Errors, strong5Value, strong5Input],
    [strong6Errors, strong6Value, strong6Input],
  ] = createEntries([
    getFieldParams('text'),
    getFieldParams('translation'),
    getFieldParams('plural'),
    getFieldParams('strong1'),
    getFieldParams('strong2'),
    getFieldParams('strong3'),
    getFieldParams('strong4'),
    getFieldParams('strong5'),
    getFieldParams('strong6')
  ]);
</script>

<form class="game" use:createForm={{ onSuccess }} on:submit|preventDefault>
  <h1>Добавить</h1>

  <FormElement label="Выберите тип">
    <select bind:value={type}>
      <option value="word">Слово</option>
      <option value="phrase">Фраза</option>
    </select>
  </FormElement>

  <FormElement errors={textErrors} label={type === 'word' ? 'Слово' : 'Фраза'}>
    <input type="text" bind:value={$textValue} use:textInput />
  </FormElement>

  {#if type === 'word'}
    <FormElement label="Тип">
      <select bind:value={wordType}>
        <option value="noun">существительное</option>
        <option value="verb">глагол</option>
        <option value="other">другое</option>
      </select>
    </FormElement>

    {#if wordType === 'noun'}
      <FormElement label="Артикль">
        <select bind:value={article}>
          <option>der</option>
          <option>die</option>
          <option>das</option>
        </select>
      </FormElement>

      <FormElement errors={pluralErrors} label="Plural">
        <input type="text" bind:value={$pluralValue} use:pluralInput />
      </FormElement>
    {:else if wordType === 'verb'}
      <FormSwitcher type="checkbox" bind:checked={strongVerb}>Сильный глагол</FormSwitcher>

      {#if strongVerb}
        <FormElement errors={strong1Errors} label="Ich">
          <input type="text" bind:value={$strong1Value} use:strong1Input />
        </FormElement>
        <FormElement errors={strong2Errors} label="du">
          <input type="text" bind:value={$strong2Value} use:strong2Input />
        </FormElement>
        <FormElement errors={strong3Errors} label="er, sie, es">
          <input type="text" bind:value={$strong3Value} use:strong3Input />
        </FormElement>
        <FormElement errors={strong4Errors} label="wir">
          <input type="text" bind:value={$strong4Value} use:strong4Input />
        </FormElement>
        <FormElement errors={strong5Errors} label="ihr">
          <input type="text" bind:value={$strong5Value} use:strong5Input />
        </FormElement>
        <FormElement errors={strong6Errors} label="Sie, sie">
          <input type="text" bind:value={$strong6Value} use:strong6Input />
        </FormElement>
      {/if}
    {/if}
  {/if}

  <FormElement errors={translationErrors} label="Перевод">
    <input type="text" bind:value={$translationValue} use:translationInput />
  </FormElement>

  <Button type="submit" text="Готово" color="primary" />
</form>

<style>

</style>
