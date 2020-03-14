<script>
  export let word = {};

  import FormInput from 'sdk/form-input/form-input.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import ButtonsRow from 'sdk/buttons-row/buttons-row.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation';
  import Categories from './categories.svelte';
  import Slide from 'sdk/transition/slide.svelte';
  import { categories, words, user } from 'stores';

  let { wordId = null } = word;
  let type = word.type || '';
  let strongVerb = word.strong1 || word.strong2 || word.strong3 || word.strong4 || word.strong5 || word.strong6;
  let irregularVerb = word.irregular1 || word.irregular2;

  let createdCategories = [];
  let linkedCategories = wordId ? categories.getCategoriesByWordId(wordId) : [];
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
    cb: ({ newCategories, newAndLinkedCategories, wordId: id }) => {
      const newWordObj = {
        userId: user.userId,
        wordId: wordId || id,
        type,
      };

      if (!wordId) {
        newWordObj.active = true;
      }

      if (type === 'noun') {
        newWordObj.original = $nounOrigValue;
        newWordObj.translation = $nounTrValue;
        newWordObj.plural = $pluralValue;
        newWordObj.article = $articleValue;
      } else if (type === 'verb') {
        newWordObj.original = $verbOrigValue;
        newWordObj.translation = $verbTrValue;
        newWordObj.strong1 = $strong1Value;
        newWordObj.strong2 = $strong2Value;
        newWordObj.strong3 = $strong3Value;
        newWordObj.strong4 = $strong4Value;
        newWordObj.strong5 = $strong5Value;
        newWordObj.strong6 = $strong6Value;
        newWordObj.irregular1 = $irregular1Value;
        newWordObj.irregular2 = $irregular2Value;
      } else {
        newWordObj.original = $otherOrigValue;
        newWordObj.translation = $otherTrValue;
      }

      // update word
      $words[newWordObj.wordId] = {
        ...$words[newWordObj.wordId],
        ...newWordObj,
      };

      if (newCategories) {
        categories.createCategories(newCategories);
      }

      if (wordId) {
        categories.removeWordFromCategories(wordId);
      }

      if (categoriesActive) {
        categories.assignWordToCategories(wordId || id, [...linkedCategories, ...newAndLinkedCategories]);
      }

      if (wordId) {
        // useRoute({ componentId: 'dict' });
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

<div>
  <h1>{wordId ? 'Редактировать' : 'Добавить'} слово</h1>

  {#if !wordId}
    <ButtonsRow twoInARow>
      <button on:click|preventDefault={() => resetState('noun')} class:active={type === 'noun'}>Существ.</button>
      <button on:click|preventDefault={() => resetState('verb')} class:active={type === 'verb'}>Глагол</button>
      <button on:click|preventDefault={() => resetState('phrase')} class:active={type === 'phrase'}>Фраза</button>
      <button on:click|preventDefault={() => resetState('other')} class:active={type === 'other'}>Другое</button>
    </ButtonsRow>
  {/if}

  {#if type}
    {#if type === 'noun'}
      <FormValidation form={nounForm}>
        <ButtonsRow error={$articleErrors.length}>
          <button on:click|preventDefault={() => articleChange('der')} class:active={$articleValue === 'der'}>der</button>
          <button on:click|preventDefault={() => articleChange('die')} class:active={$articleValue === 'die'}>die</button>
          <button on:click|preventDefault={() => articleChange('das')} class:active={$articleValue === 'das'}>das</button>
        </ButtonsRow>

        <FormInput errors={nounOrigErrors} label="Слово">
          <input type="text" bind:value={$nounOrigValue} use:nounOrigInput />
        </FormInput>

        <FormInput errors={nounTrErrors} label="Перевод">
          <input type="text" bind:value={$nounTrValue} use:nounTrInput />
        </FormInput>

        <FormInput errors={pluralErrors} label="Plural">
          <input type="text" bind:value={$pluralValue} use:pluralInput />
        </FormInput>

        <Categories bind:linked={linkedCategories} bind:created={createdCategories} bind:active={categoriesActive} />

        <Button type="submit" text={wordId ? 'редактировать' : 'создать'} />
      </FormValidation>
    {/if}

    {#if type === 'phrase' || type === 'other'}
      <FormValidation form={otherForm}>
        <FormInput errors={otherOrigErrors} label={type === 'other' ? 'Слово' : 'Фраза'}>
          <input type="text" bind:value={$otherOrigValue} use:otherOrigInput />
        </FormInput>

        <FormInput errors={otherTrErrors} label="Перевод">
          <input type="text" bind:value={$otherTrValue} use:otherTrInput />
        </FormInput>

        <Categories bind:linked={linkedCategories} bind:created={createdCategories} bind:active={categoriesActive} />

        <Button type="submit" text={wordId ? 'редактировать' : 'создать'} />
      </FormValidation>
    {/if}

    {#if type === 'verb'}
      <FormValidation form={verbForm}>
        <FormInput errors={verbOrigErrors} label="Слово">
          <input type="text" bind:value={$verbOrigValue} use:verbOrigInput />
        </FormInput>

        <FormInput errors={verbTrErrors} label="Перевод">
          <input type="text" bind:value={$verbTrValue} use:verbTrInput />
        </FormInput>

        <FormSwitcher type="toggle" bind:checked={strongVerb}>Сильный глагол</FormSwitcher>

        <Slide active={strongVerb}>
          <FormInput errors={strong1Errors} label="Ich">
            <input type="text" bind:value={$strong1Value} use:strong1Input />
          </FormInput>
          <FormInput errors={strong2Errors} label="du">
            <input type="text" bind:value={$strong2Value} use:strong2Input />
          </FormInput>
          <FormInput errors={strong3Errors} label="er, sie, es">
            <input type="text" bind:value={$strong3Value} use:strong3Input />
          </FormInput>
          <FormInput errors={strong4Errors} label="wir">
            <input type="text" bind:value={$strong4Value} use:strong4Input />
          </FormInput>
          <FormInput errors={strong5Errors} label="ihr">
            <input type="text" bind:value={$strong5Value} use:strong5Input />
          </FormInput>
          <FormInput errors={strong6Errors} label="Sie, sie">
            <input type="text" bind:value={$strong6Value} use:strong6Input />
          </FormInput>
        </Slide>

        <FormSwitcher type="toggle" bind:checked={irregularVerb}>Неправильный глагол</FormSwitcher>

        <Slide active={irregularVerb}>
          <FormInput errors={irregular1Errors} label="Präteritum">
            <input type="text" bind:value={$irregular1Value} use:irregular1Input />
          </FormInput>
          <FormInput errors={irregular2Errors} label="Partizip II">
            <input type="text" bind:value={$irregular2Value} use:irregular2Input />
          </FormInput>
        </Slide>

        <Categories bind:linked={linkedCategories} bind:created={createdCategories} bind:active={categoriesActive} />

        <Button type="submit" text={wordId ? 'редактировать' : 'создать'} />
      </FormValidation>
    {/if}
  {/if}
</div>
