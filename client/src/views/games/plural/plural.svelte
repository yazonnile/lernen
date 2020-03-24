<script>
  import Button from 'sdk/button/button.svelte';
  import LampRow from 'sdk/lamp-row/lamp-row.svelte';
  import FormBox from 'sdk/form-box/form-box.svelte';
  import FormInput from 'sdk/form-input/form-input.svelte';
  import { bottomAnimation, fly } from 'views/games/games-transitions';
  import Game from 'views/games/game.svelte';
  import { words, user } from 'stores';

  let wordId;
  let answerVisible = false;
  let customPluralValue = '';

  const firstLevelPluralLamp = [
    { id: 'plural', text: 'pl.' },
    { id: 'kein', text: 'kein pl.' },
    { id: 'custom', text: 'написать' },
  ];

  const pluralForLam = [
    { id: '-', text: '-' },
    { id: 'e', text: '-e' },
    { id: 'er', text: '-er' },
    { id: 'en', text: '-en' },
    { id: 'nen', text: '-nen' },
    { id: 'n', text: '-n' },
    { id: 's', text: '-s' },
  ];

  let selectedPlural = null;
  const onSelect = ({ detail }) => {
    if (!selectedPlural) {
      selectedPlural = detail;

      if (selectedPlural !== 'custom') {
        answerVisible = true;
      }
    }
  };

  const isError = (word) => {
    if (selectedPlural === 'custom') {
      return;
    }

    if (selectedPlural === 'kein') {
      return word.plural !== 'kein plural';
    }

    if (selectedPlural === 'plural') {
      return word.plural !== '';
    }

    return word.plural.toLowerCase() !== (word.original.toLowerCase() + (selectedPlural === '-' ? '' : selectedPlural));
  };

  let customError = null;
  let checked = false;
  const check = (word) => {
    if (checked) {
      return;
    }

    checked = true;
    answerVisible = true;

    if (word.plural.toLowerCase() !== customPluralValue.toLowerCase()) {
      customError = true;
    }
  };

  $: {
    if (!answerVisible) {
      selectedPlural = null;
    }
  }
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
            {#if $user.articles && $words[wordId].plural !== 'kein plural'}
              die
            {/if}
            {$words[wordId].plural}
          </p>
        {/if}
      </div>

    </div>
    <div class="cart">
      <LampRow
        error={selectedPlural && isError($words[wordId])}
        on:select={onSelect}
        value={selectedPlural}
        items={pluralForLam}
      />

      <LampRow
        error={selectedPlural && isError($words[wordId])}
        on:select={onSelect}
        value={selectedPlural}
        items={firstLevelPluralLamp}
      />

      <div class="box">
        {#if selectedPlural === 'custom'}
          <div in:fly|local={bottomAnimation} class:error={customError}>
            <FormBox>
              <FormInput>
                <input type="text" placeholder="..." bind:value={customPluralValue} />
              </FormInput>
            </FormBox>
            {#if !checked}
              <div transition:fly|local={bottomAnimation}>
                <Button text="готово" on:click={() => check($words[wordId])} />
              </div>
            {/if}
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
    margin-bottom: 10px;
  }

  .wrap :global(.lamp-row--fake) {
    background: var(--gamePluralBg);
  }

  .wrap :global(.lamp-row--error .lamp-row--fake) {
    background: var(--buttonRedBg);
  }

  .box {
    height: 99px;
    margin-top: 10px;
    width: 100%;
  }

  .box :global(.button) {
    margin-top: 10px;
  }

  .wrap .error :global(.form-box .wrap) {
    background: var(--buttonRedBg);
  }
</style>
