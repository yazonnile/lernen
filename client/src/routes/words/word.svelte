<script>
  export let word = {};
  export let linkedCategories = [];

  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import FormElement from 'sdk/form-element/form-element.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import ButtonsRow from 'sdk/buttons-row/buttons-row.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation';
  import Categories from 'sdk/categories/categories.svelte';
  import { useRoute } from 'lib/router/router';
  import { page } from 'stores';

  let { wordId = null } = word;
  let type = word.type || '';
  let strongVerb = word.strong1 || word.strong2 || word.strong3 || word.strong4 || word.strong5 || word.strong6;
  let irregularVerb = word.irregular1 || word.irregular2;

  let createdCategories = [];
  let categoriesActive = !!linkedCategories.length;

  const resetState = (t = '') => {
    word = {};
    type = t;
    categoriesActive = false;
    linkedCategories = [];
    createdCategories = [];
    strongVerb = false;
    irregularVerb = false;
    if (type === 'noun') {
      $nounOrigValue = '';
      $nounTrValue = '';
      $pluralValue = '';
      $articleValue = '';
      clearNounErrors();
    } else if (type === 'verb') {
      $verbOrigValue = '';
      $verbTrValue = '';
      $strong1Value = '';
      $strong2Value = '';
      $strong3Value = '';
      $strong4Value = '';
      $strong5Value = '';
      $strong6Value = '';
      $irregular1Value = '';
      $irregular2Value = '';
      clearVerbErrors();
    } else {
      $otherOrigValue = '';
      $otherTrValue = '';
      $otherTypeValue = '';
      clearOtherErrors();
    }
  };

  const params = {
    initialValues: word,
    assignPayload: (payload) => ({ ...payload, type, linkedCategories, createdCategories, categoriesActive, wordId, strongVerb, irregularVerb }),
    cb: ({ categories }) => {
      $page.categories = categories;
      if (wordId) {
        useRoute({ componentId: 'home' });
      } else {
        resetState();
      }
    }
  };

  let {
    entries: {
      original: [ nounOrigErrors, nounOrigValue, nounOrigInput ],
      translation: [ nounTrErrors, nounTrValue, nounTrInput ],
      plural: [ pluralErrors, pluralValue, pluralInput ],
      article: [ articleErrors, articleValue ]
    },
    form: nounForm,
    clearErrors: clearNounErrors
  } = createValidation({ componentId: 'words', routeId: 'saveNoun' }, params);

  const articleChange = (article) => {
    $articleValue = article;
    $articleErrors = {};
  };

  let {
    entries: {
      original: [ otherOrigErrors, otherOrigValue, otherOrigInput ],
      translation: [ otherTrErrors, otherTrValue, otherTrInput ],
      type: [ otherTypeErrors, otherTypeValue ],
    },
    form: otherForm,
    clearErrors: clearOtherErrors
  } = createValidation({ componentId: 'words', routeId: 'saveOther' }, params);
  $: $otherTypeValue = type; // workaround to skip validation

  let {
    entries: {
      original: [ verbOrigErrors, verbOrigValue, verbOrigInput ],
      translation: [ verbTrErrors, verbTrValue, verbTrInput ],
      strong1: [ strong1Errors, strong1Value, strong1Input ],
      strong2: [ strong2Errors, strong2Value, strong2Input ],
      strong3: [ strong3Errors, strong3Value, strong3Input ],
      strong4: [ strong4Errors, strong4Value, strong4Input ],
      strong5: [ strong5Errors, strong5Value, strong5Input ],
      strong6: [ strong6Errors, strong6Value, strong6Input ],
      irregular1: [ irregular1Errors, irregular1Value, irregular1Input ],
      irregular2: [ irregular2Errors, irregular2Value, irregular2Input ],
    },
    form: verbForm,
    clearErrors: clearVerbErrors
  } = createValidation({ componentId: 'words', routeId: 'saveVerb' }, params);
</script>

<DocumentTitle title="add word" />
<div>
  <h1>{wordId ? 'Редактировать' : 'Добавить'} слово</h1>

  <ButtonsRow twoInARow>
    <button on:click|preventDefault={() => resetState('noun')} class:active={type === 'noun'}>Существ.</button>
    <button on:click|preventDefault={() => resetState('verb')} class:active={type === 'verb'}>Глагол</button>
    <button on:click|preventDefault={() => resetState('phrase')} class:active={type === 'phrase'}>Фраза</button>
    <button on:click|preventDefault={() => resetState('other')} class:active={type === 'other'}>Другое</button>
  </ButtonsRow>

  {#if type === 'noun'}
    <FormValidation form={nounForm}>
      <ButtonsRow error={$articleErrors.length}>
        <button on:click|preventDefault={() => articleChange('der')} class:active={$articleValue === 'der'}>der</button>
        <button on:click|preventDefault={() => articleChange('die')} class:active={$articleValue === 'die'}>die</button>
        <button on:click|preventDefault={() => articleChange('das')} class:active={$articleValue === 'das'}>das</button>
      </ButtonsRow>

      <FormElement errors={nounOrigErrors} label="Слово">
        <input type="text" bind:value={$nounOrigValue} use:nounOrigInput />
      </FormElement>

      <FormElement errors={nounTrErrors} label="Перевод">
        <input type="text" bind:value={$nounTrValue} use:nounTrInput />
      </FormElement>

      <FormElement errors={pluralErrors} label="Plural">
        <input type="text" bind:value={$pluralValue} use:pluralInput />
      </FormElement>

      <Categories bind:linked={linkedCategories} bind:created={createdCategories} bind:active={categoriesActive} />

      <Button type="submit" text={wordId ? 'редактировать' : 'создать'} />
    </FormValidation>
  {/if}

  {#if type === 'phrase' || type === 'other'}
    <FormValidation form={otherForm}>
      <FormElement errors={otherOrigErrors} label={type === 'other' ? 'Слово' : 'Фраза'}>
        <input type="text" bind:value={$otherOrigValue} use:otherOrigInput />
      </FormElement>

      <FormElement errors={otherTrErrors} label="Перевод">
        <input type="text" bind:value={$otherTrValue} use:otherTrInput />
      </FormElement>

      <Categories bind:linked={linkedCategories} bind:created={createdCategories} bind:active={categoriesActive} />

      <Button type="submit" text={wordId ? 'редактировать' : 'создать'} />
    </FormValidation>
  {/if}

  {#if type === 'verb'}
    <FormValidation form={verbForm}>
      <FormElement errors={verbOrigErrors} label="Слово">
        <input type="text" bind:value={$verbOrigValue} use:verbOrigInput />
      </FormElement>

      <FormElement errors={verbTrErrors} label="Перевод">
        <input type="text" bind:value={$verbTrValue} use:verbTrInput />
      </FormElement>

      <FormSwitcher type="toggle" bind:checked={strongVerb}>Сильный глагол</FormSwitcher>

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

      <FormSwitcher type="toggle" bind:checked={irregularVerb}>Неправильный глагол</FormSwitcher>

      {#if irregularVerb}
        <FormElement errors={irregular1Errors} label="Präteritum">
          <input type="text" bind:value={$irregular1Value} use:irregular1Input />
        </FormElement>
        <FormElement errors={irregular2Errors} label="Partizip II">
          <input type="text" bind:value={$irregular2Value} use:irregular2Input />
        </FormElement>
      {/if}

      <Categories bind:linked={linkedCategories} bind:created={createdCategories} bind:active={categoriesActive} />

      <Button type="submit" text={wordId ? 'редактировать' : 'создать'} />
    </FormValidation>
  {/if}
</div>
