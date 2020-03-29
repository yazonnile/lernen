<script>
  export let original;
  export let answerVisible;

  import diff from 'lib/diff/diff';
  import shuffle from 'lib/shuffle/shuffle';
  import alphabet from 'api/a-z/a-z';

  let extraLetters = 6;
  let errors;
  let currentIndex;
  let placeholder;
  let letters;

  const onClick = (i) => {
    const newLetter = letters[i].toLowerCase();
    if (newLetter !== original[currentIndex]) {
      errors[i] = 1;
      return;
    }

    errors = {};
    currentIndex++;
    letters[i] = '_';
    letters = [...letters];

    if (currentIndex === placeholder.length) {
      answerVisible = true;
    }
  };

  $: {
    if (!answerVisible) {
      currentIndex = 0;
      placeholder = original.split('');
      errors = {};
      letters = shuffle([
        ...placeholder,
        ...(shuffle(
          diff(
            placeholder,
            alphabet.map(l => l.toLowerCase())
          )
        ).slice(0, Math.round(extraLetters * Math.random())))
      ]);
    }
  }
</script>
<div class="letters">
  {#each letters as l, i (l + i)}
    <div class="letter" class:lower={l === 'ß'}>
      {#if l === '_'}
        <span></span>
      {:else if errors[i]}
        <span class="error scale-in">{l}</span>
      {:else}
        <span class="bg scale-in" on:click={() => onClick(i)}>{l}</span>
      {/if}
    </div>
  {/each}
</div>

<div
  class="result"
  class:result--success={answerVisible}
>
  {#each placeholder as p, i}
    <span class="letter" class:lower={p === 'ß'}>
      {#if i < currentIndex}
        <span class="bg scale-in">{p}</span>
      {:else}
        <span class="empty"></span>
      {/if}
    </span>
  {/each}
</div>

<style>
  .letters,
  .result {
    align-content: flex-start;
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    justify-content: center;
    margin-right: -10px;
    width: 100%;
  }

  .result {
    align-content: flex-end;
  }

  .letter {
    display: flex;
    font-size: 20px;
    flex: 0 0 30px;
    height: 30px;
    line-height: 30px;
    margin: 10px 10px 0 0;
    position: relative;
    text-align: center;
    text-transform: uppercase;
    width: 30px;
  }

  .lower {
    text-transform: lowercase;
  }

  .letter span {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .bg {
    background: var(--gameSpellingBg);
  }

  .result--success .bg {
    background: var(--gameTranslationFirstContrast);
  }

  .empty {
    background: var(--gameSpellingContrast);
  }

  .error {
    background: var(--buttonRedContrast);
  }
</style>
