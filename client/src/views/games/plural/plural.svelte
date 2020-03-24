<script>
  import diff from 'lib/diff/diff';
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

  let umlautValue = null;
  const umlautForLamp = [
    { id: 'Ä', text: 'Ä' },
    { id: 'Ö', text: 'Ö' },
    { id: 'Ü', text: 'Ü' },
  ];
  const umlautMap = {
    'Ä': 'A',
    'Ö': 'O',
    'Ü': 'U',
  };

  const umlautOnSelect = ({ detail }) => {
    if (answerVisible) {
      return;
    }

    if (!umlautValue) {
      umlautValue = detail;
    }
  };

  const matchUmlautLetter = (plural, original, letter) => {
    const diffResult = diff(
            original.toUpperCase().split(''),
            plural.toUpperCase().split('')
    );

    letter = letter || umlautValue;
    return diffResult[0] === letter;
  };

  const matchUmlautPluralForm = (plural, original, letter, form) => {
    letter = letter || umlautValue;
    plural = plural.toLowerCase().replace(
            letter.toLowerCase(),
            umlautMap[letter]
    );

    form = form || pluralFormValue;
    return form === '-' ? plural.toLowerCase() === original.toLowerCase() : (
            plural.toLowerCase() === original.toLowerCase() + form
    );
  };

  let pluralFormValue = null;
  const pluralFormForLamp = [
    { id: '-', text: '-' },
    { id: 'e', text: '-e' },
    { id: 'er', text: '-er' },
    { id: 'en', text: '-en' },
    { id: 'nen', text: '-nen' },
    { id: 'n', text: '-n' },
    { id: 's', text: '-s' },
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
      umlautValue = null;
    }
  }

  const typeError = ({ plural, original }) => {
    // check kein plural
    if ((plural === 'kein plural' && typeValue !== 'kein') || (plural !== 'kein plural' && typeValue === 'kein')) {
      return true;
    }

    // check plural only
    if ((plural === '' && typeValue !== 'plural') || (plural !== '' && typeValue === 'plural')) {
      return true;
    }

    if (typeValue === 'umlaut') {
      for (let i = 0; i < umlautForLamp.length; i++) {
        if (matchUmlautLetter(plural, original, umlautForLamp[i].id)) {
          for (let j = 0; j < pluralFormForLamp.length; j++) {
            if (matchUmlautPluralForm(plural, original, umlautForLamp[i].id, pluralFormForLamp[j].id)) {
              return;
            }
          }
        }
      }

      return true;
    }
  };

  const umlautError = ({ plural, original }) => {
    return !matchUmlautLetter(plural, original);
  };

  const formError = ({ plural, original }) => {
    if (typeValue === 'umlaut') {
      return !matchUmlautPluralForm(plural, original);
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
    <div class="cart">
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
        {#if typeValue === 'umlaut' && !typeError($words[wordId])}
          <div transition:fly|local={bottomAnimation}>
            <LampRow
              error={umlautValue && umlautError($words[wordId]) && showAnswer()}
              on:select={umlautOnSelect}
              value={umlautValue}
              items={umlautForLamp}
            />
          </div>
        {/if}
      </div>

      <div class="box">
        {#if !(typeValue && typeError($words[wordId]))
          && !(typeValue === 'umlaut' && umlautError($words[wordId]))
          && !(typeValue && !typeError($words[wordId]))
          || umlautValue}
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

  .cart {
    align-items: center;
    background: var(--gamePluralBg);
    display: flex;
    flex: 0 0 calc(40% - 5px);
    flex-direction: column;
    font-size: 30px;
    justify-content: center;
    line-height: 35px;
    text-align: center;
  }

  .cart + .cart {
    background: none;
    flex: 0 0 calc(60% - 5px);
    margin-top: 10px;
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
