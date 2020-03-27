<script>
  export let word = {};

  import FormInput from 'sdk/form-input/form-input.svelte';
  import Button from 'sdk/button/button.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import LampRow from 'sdk/lamp-row/lamp-row.svelte';
  import FormValidation from 'sdk/form-validation/form-validation.svelte';
  import createValidation from 'lib/validation/validation';
  import WordCategories from './words-categories.svelte';
  import FormBox from 'sdk/form-box/form-box.svelte';
  import { words, messages } from 'stores';

  let { wordId = null, categories: linkedCategories = [] } = word;
  let strongVerb = words.verbIsStrong(word);
  let irregularVerb = words.verbIsIrregular(word);

  let categoriesActive = !!linkedCategories.length;

  const callback = (values) => {
    const wordObject = {
      ...values,
      active: !wordId || word.active,
      categories: categoriesActive ? linkedCategories : []
    };

    if (wordId) {
      wordObject.wordId = wordId;
    }

    // check word exists
    if (!wordId && words.wordExists(wordObject)) {
      messages.addMessage({
        status: 'error',
        text: 'wordExists.error'
      });
      return;
    }

    // save word
    words.updateWord(wordObject);

    messages.addMessage({
      status: 'success',
      text: wordId ? 'wordEdit.success' : 'wordCreate.success'
    });

    if (!wordId) {
      setTimeout(resetState, 1);
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

  const typeLampData = [
    { id: 'noun', text: 'Существительное' },
    { id: 'verb', text: 'Глагол' },
    { id: 'phrase', text: 'Фраза' },
    { id: 'other', text: 'Другое' }
  ];

  const articleLampData = [
    { id: 'der', text: 'der' },
    { id: 'die', text: 'die' },
    { id: 'das', text: 'das' }
  ];
</script>

{#if !wordId}
  <LampRow items={typeLampData} value={$typeValue} on:select={({ detail }) => resetState(detail)} />
{/if}

{#if $typeValue}
  <FormValidation {form}>
    {#if $typeValue === 'noun'}
      <div class="row">
        <LampRow error={!$articleValue && $origValue} items={articleLampData} value={$articleValue} on:select={({ detail }) => articleChange(detail)} />
      </div>
    {/if}

    <div class="row">
      <FormBox>
        <FormInput errors={trErrors} label="Перевод">
          <input type="text" bind:value={$trValue} use:trInput placeholder={$typeValue === 'phrase' ? 'Как Вас зовут?' : 'Хлеб'} />
        </FormInput>
        <FormInput errors={origErrors} label={$typeValue === 'phrase' ? 'Фраза' : 'Слово'}>
          <input type="text" bind:value={$origValue} use:origInput placeholder={$typeValue === 'phrase' ? 'Wie heißen Sie?' : 'Brot'} />
        </FormInput>

        {#if $typeValue === 'noun'}
          <FormInput errors={pluralErrors} label="Plural">
            <input type="text" bind:value={$pluralValue} use:pluralInput placeholder="Brote" />
          </FormInput>
        {/if}

        {#if $typeValue === 'verb'}
          <FormSwitcher type="toggle" bind:checked={strongVerb}>Сильный глагол</FormSwitcher>

          {#if strongVerb}
            <FormInput errors={strong1Errors} label="Ich">
              <input type="text" bind:value={$strong1Value} use:strong1Input placeholder="bin" />
            </FormInput>
            <FormInput errors={strong2Errors} label="du">
              <input type="text" bind:value={$strong2Value} use:strong2Input placeholder="bist" />
            </FormInput>
            <FormInput errors={strong3Errors} label="er, sie, es">
              <input type="text" bind:value={$strong3Value} use:strong3Input placeholder="ist" />
            </FormInput>
            <FormInput errors={strong4Errors} label="wir">
              <input type="text" bind:value={$strong4Value} use:strong4Input placeholder="sind" />
            </FormInput>
            <FormInput errors={strong5Errors} label="ihr">
              <input type="text" bind:value={$strong5Value} use:strong5Input placeholder="seid" />
            </FormInput>
            <FormInput errors={strong6Errors} label="Sie, sie">
              <input type="text" bind:value={$strong6Value} use:strong6Input placeholder="sind" />
            </FormInput>
          {/if}

          <FormSwitcher type="toggle" bind:checked={irregularVerb}>Неправильный глагол</FormSwitcher>

          {#if irregularVerb}
            <FormInput errors={irregular1Errors} label="Präteritum">
              <input type="text" bind:value={$irregular1Value} use:irregular1Input placeholder="ging" />
            </FormInput>
            <FormInput errors={irregular2Errors} label="Partizip II">
              <input type="text" bind:value={$irregular2Value} use:irregular2Input placeholder="gegangen" />
            </FormInput>
          {/if}
        {/if}

      </FormBox>
    </div>

    <WordCategories bind:linked={linkedCategories} bind:active={categoriesActive} />

    <div class="row">
      <Button type="submit" text={wordId ? 'обновить' : 'создать'} />
    </div>
  </FormValidation>
{/if}

<style>
  .row {
    margin-top: 20px;
  }

  :global(form):first-child .row:first-child {
    margin-top: 0;
  }
</style>
