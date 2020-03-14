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
  let strongVerb = words.verbIsStrong(word);
  let irregularVerb = words.verbIsIrregular(word);

  let createdCategories = [];
  let linkedCategories = wordId ? categories.getCategoriesByWordId(wordId) : [];
  let categoriesActive = !!linkedCategories.length;

  const callback = (values) => {
    const wordObject = {
      ...values,
      userId: user.userId
    };

    if (!wordId) {
      wordObject.active = true;
      wordObject.wordId = +(Math.random() * 100000).toFixed(); // TODO: SYNC
    }

    // save word
    words.updateWord(wordObject);

    // create categories
    if (createdCategories) {
      categories.createCategories(createdCategories);
    }

    // assign word into linked categories if categoriesActive
    categories.removeWordFromCategories(wordId);
    if (categoriesActive) {
      categories.assignWordToCategories(wordObject.wordId, [...linkedCategories]); // TODO: SYNC
    }

    if (!wordId) {
      resetState();
    }
  };

  let {
    form, clearErrors,
    entries: {
      type: [ typeErrors, typeValue ],
      original: [ origErrors, origValue, origInput ],
      translation: [ trErrors, trValue, trInput ],
      plural: [ pluralErrors, pluralValue, pluralInput ],
      article: [ articleErrors, articleValue ],
      strong1: [ strong1Errors, strong1Value, strong1Input ],
      strong2: [ strong2Errors, strong2Value, strong2Input ],
      strong3: [ strong3Errors, strong3Value, strong3Input ],
      strong4: [ strong4Errors, strong4Value, strong4Input ],
      strong5: [ strong5Errors, strong5Value, strong5Input ],
      strong6: [ strong6Errors, strong6Value, strong6Input ],
      irregular1: [ irregular1Errors, irregular1Value, irregular1Input ],
      irregular2: [ irregular2Errors, irregular2Value, irregular2Input ],
    },
  } = createValidation({
    scheme: ['type', 'original', 'plural', 'article', 'translation', 'strong1', 'strong2', 'strong3', 'strong4', 'strong5', 'strong6', 'irregular1', 'irregular2'],
    initial: word
  }, callback);

  const articleChange = (article) => {
    $articleValue = article;
    $articleErrors = [];
  };

  const resetState = (t = '') => {
    word = {};
    $typeValue = t;
    categoriesActive = false;
    linkedCategories = [];
    createdCategories = [];
    strongVerb = false;
    irregularVerb = false;

    $origValue = '';
    $trValue = '';
    $pluralValue = '';
    $articleValue = '';
    $strong1Value = '';
    $strong2Value = '';
    $strong3Value = '';
    $strong4Value = '';
    $strong5Value = '';
    $strong6Value = '';
    $irregular1Value = '';
    $irregular2Value = '';

    clearErrors(true);
  };
</script>

<div>
  <h1>{wordId ? 'Редактировать' : 'Добавить'} слово</h1>

  {#if !wordId}
    <ButtonsRow twoInARow>
      <button on:click|preventDefault={() => resetState('noun')} class:active={$typeValue === 'noun'}>Существ.</button>
      <button on:click|preventDefault={() => resetState('verb')} class:active={$typeValue === 'verb'}>Глагол</button>
      <button on:click|preventDefault={() => resetState('phrase')} class:active={$typeValue === 'phrase'}>Фраза</button>
      <button on:click|preventDefault={() => resetState('other')} class:active={$typeValue === 'other'}>Другое</button>
    </ButtonsRow>
  {/if}

  {#if $typeValue}
    <FormValidation {form}>
      {#if $typeValue === 'noun'}
        <ButtonsRow error={!$articleValue}>
          <button on:click|preventDefault={() => articleChange('der')} class:active={$articleValue === 'der'}>der</button>
          <button on:click|preventDefault={() => articleChange('die')} class:active={$articleValue === 'die'}>die</button>
          <button on:click|preventDefault={() => articleChange('das')} class:active={$articleValue === 'das'}>das</button>
        </ButtonsRow>
      {/if}

      <FormInput errors={origErrors} label={$typeValue === 'phrase' ? 'Фраза' : 'Слово'}>
        <input type="text" bind:value={$origValue} use:origInput />
      </FormInput>

      <FormInput errors={trErrors} label="Перевод">
        <input type="text" bind:value={$trValue} use:trInput />
      </FormInput>

      {#if $typeValue === 'noun'}
        <FormInput errors={pluralErrors} label="Plural">
          <input type="text" bind:value={$pluralValue} use:pluralInput />
        </FormInput>
      {/if}

      {#if $typeValue === 'verb'}
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
      {/if}

      <Categories bind:linked={linkedCategories} bind:created={createdCategories} bind:active={categoriesActive} />

      <Button type="submit" text={wordId ? 'редактировать' : 'создать'} />
    </FormValidation>
  {/if}
</div>
