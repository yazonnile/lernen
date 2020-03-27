<script>
  import getFirstMismatch from 'lib/get-first-mismatch/get-first-mismatch';
  import LampRow from 'sdk/lamp-row/lamp-row.svelte';
  import { bottomAnimation, fly } from 'views/games/games-transitions';
  import Game from 'views/games/game.svelte';
  import { words, user } from 'stores';

  let wordId;
  let answerVisible = false;

  const showAnswer = () => {
    answerVisible = true;
    return true;
  };

  let typeValue = null;
  let typeLampItems = [
    { id: 'plural', text: 'pl.' },
    { id: 'kein', text: 'kein pl.' },
    { id: 'umlaut', text: 'umlaut' },
    { id: 'custom', text: 'другое' },
  ];

  const typeOnSelect = ({ detail }) => {
    if (answerVisible) {
      return;
    }

    if (pluralFormValue) {
      return;
    }

    if (!typeValue) {
      typeValue = detail;

      if (typeValue !== 'umlaut') {
        answerVisible = true;
      }
    }
  };

  const matchUmlautLetter = (plural, original, letter) => {
    const mismatch = getFirstMismatch(
      original.toLowerCase().split(''),
      plural.toLowerCase().split('')
    );

    letter = letter || '';
    return mismatch[1] === letter.toLowerCase();
  };

  const matchUmlautPluralForm = (plural, original, umlautLetter = '', form) => {
    const umlautMap = {
      'ä': 'a',
      'ö': 'o',
      'ü': 'u',
    };

    umlautLetter = umlautLetter.toLowerCase();
    plural = plural.toLowerCase();
    original = original.toLowerCase();
    form = form || pluralFormValue;

    const letter = umlautMap[umlautLetter];
    const pluralWithoutUmlaut = plural.replace(umlautLetter, letter);

    if (form !== '-') {
      original += form;
    }

    return original === pluralWithoutUmlaut;
  };

  let pluralFormValue = null;
  const pluralFormForLamp = [
    { id: '-', text: '-' },
    { id: 'e', text: '-e' },
    { id: 's', text: '-s' },
    { id: 'n', text: '-n' },
    { id: 'er', text: '-er' },
    { id: 'en', text: '-en' },
    { id: 'nen', text: '-nen' },
  ];

  const pluralFormOnSelect = ({ detail }) => {
    if (answerVisible) {
      return;
    }

    if (!pluralFormValue) {
      pluralFormValue = detail;
      answerVisible = true;
    }
  };

  $: {
    if (!answerVisible) {
      typeValue = null;
      pluralFormValue = null;
    }
  }

  const isUmlaut = ({ plural, original }) => {
    const umlautLetters = ['ä', 'ö', 'ü'];
    for (let i = 0; i < umlautLetters.length; i++) {
      if (matchUmlautLetter(plural, original, umlautLetters[i])) {
        for (let j = 0; j < pluralFormForLamp.length; j++) {
          if (matchUmlautPluralForm(plural, original, umlautLetters[i], pluralFormForLamp[j].id)) {
            return true;
          }
        }
      }
    }
  };

  const isForm = ({ plural, original }) => {
    for (let i = 0; i < pluralFormForLamp.length; i++) {
      const form = pluralFormForLamp[i];
      if (form === '-' ? plural.toLowerCase() !== original.toLowerCase() : plural.toLowerCase() !== original.toLowerCase() + form) {
        return true;
      }
    }
  };

  const typeError = ({ plural, original }) => {
    // check kein plural
    if ((plural === 'kein plural' && typeValue !== 'kein') || (plural !== 'kein plural' && typeValue === 'kein')) {
      return true;
    }

    // check plural only
    if ((plural === '' && typeValue !== 'plural') || (plural !== '' && typeValue === 'plural')) {
      return true;
    }

    const pluralIsUmlautPositive = isUmlaut({ plural, original });
    if ((typeValue !== 'umlaut' && pluralIsUmlautPositive) || (typeValue === 'umlaut' && !pluralIsUmlautPositive)) {
      return true;
    }

    if (typeValue === 'custom' && !isForm({ plural, original })) {
      return true;
    }
  };

  const umlautError = ({ plural, original }) => {
    return !matchUmlautLetter(plural, original);
  };

  const formError = ({ plural, original }) => {
    if (typeValue === 'umlaut') {
      const mismatch = getFirstMismatch(
        original.toLowerCase().split(''),
        plural.toLowerCase().split('')
      );
      return !matchUmlautPluralForm(plural, original, mismatch[1], pluralFormValue);
    }

    if (pluralFormValue === '-') {
      return plural.toLowerCase() !== original.toLowerCase();
    }

    return plural.toLowerCase() !== original.toLowerCase() + pluralFormValue;
  };
</script>

<Game let:wordId bind:answerVisible>
  <div class="wrap">
    <div class="cart">
      <p>
        {#if $user.articles}
          {$words[wordId].article}
        {/if}
        {$words[wordId].original}
      </p>

      <div class="answer">
        {#if answerVisible}
          <p in:fly|local={bottomAnimation}>
            {#if $words[wordId].plural === 'kein plural'}
              kein plural
            {:else if $words[wordId].plural === ''}
              plural
            {:else}
              {#if $user.articles}
                die
              {/if}
              {$words[wordId].plural}
            {/if}
          </p>
        {/if}
      </div>
    </div>
    <div class="content">
      <div class="box">
        {#if !(pluralFormValue && !typeValue)}
          <div transition:fly|local={bottomAnimation}>
            <LampRow
              error={typeValue && typeError($words[wordId]) && showAnswer()}
              on:select={typeOnSelect}
              value={typeValue}
              items={typeLampItems}
            />
          </div>
        {/if}
      </div>

      <div class="box">
        {#if
          !typeValue
          || (typeValue && !typeError($words[wordId]))
          || (typeValue === 'umlaut' && !umlautError($words[wordId]))
        }
          <div transition:fly|local={bottomAnimation}>
            <LampRow
              error={pluralFormValue && formError($words[wordId]) && showAnswer()}
              on:select={pluralFormOnSelect}
              value={pluralFormValue}
              items={pluralFormForLamp}
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
</Game>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cart,
  .content {
    align-items: center;
    display: flex;
    flex-direction: column;
    font-size: 30px;
    justify-content: center;
    line-height: 35px;
    text-align: center;
  }

  .cart {
    background: var(--gamePluralBg);
    padding: 10px;
  }

  .content {
    flex: 1;
    margin-top: 10px;
    overflow-x: hidden;
  }

  .answer {
    min-height: 35px;
  }

  .wrap :global(.lamp-row) {
    width: calc(100% - 20px);
  }

  .wrap :global(.lamp-row):first-child {
    margin-bottom: 20px;
  }

  .wrap :global(.lamp-row--fake) {
    background: var(--gamePluralBg);
  }

  .wrap :global(.lamp-row--error .lamp-row--fake) {
    background: var(--buttonRedBg);
  }

  .box {
    height: 60px;
    margin-left: 20px;
    width: 100%;
  }

  .wrap .box :global(.lamp-row) {
    margin: 0 0 20px;
  }
</style>
