<script>
  import { data } from 'stores';
  import Button from 'sdk/button/button.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';

  const getRandomItem = (data) => {
    const array = Object.values(data);
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  let item = getRandomItem($data);

  let visible = false;
  const show = () => {
    visible = true;
  };

  const next = () => {
    visible = false;
    item = getRandomItem($data);
  };

  const getTextToSpeech = () => {
    if (item.wordType === 'noun') {
      return `${item.article} ${item.text}, die ${item.plural}`;
    } else {
      return item.text;
    }
  };

  const textInit = () => {
    const utterThis = new SpeechSynthesisUtterance(getTextToSpeech());
    utterThis.lang = 'de';
    utterThis.rate = .75;
    speechSynthesis.speak(utterThis);
  };



  let words = false;
  let nouns = false;
  let articles = false;
  let plural = false;
  let verbs = false;
  let strongVerbs = false;
  let others = false;
</script>

<div class="learn">
  <FormSwitcher type="checkbox">Фразы</FormSwitcher>
  <FormSwitcher type="toggle" bind:checked={words}>Слова</FormSwitcher>

  {#if words}
    <FormSwitcher type="toggle" bind:checked={nouns}>Существительные</FormSwitcher>
    {#if nouns}
      <FormSwitcher type="checkbox" bind:checked={articles}>Артикли</FormSwitcher>
      <FormSwitcher type="checkbox" bind:checked={plural}>Plural</FormSwitcher>
      <FormSwitcher type="checkbox" bind:checked={nouns}>Артикли</FormSwitcher>
    {/if}

    <FormSwitcher type="toggle" bind:checked={verbs}>Глаголы</FormSwitcher>
    {#if verbs}
      <FormSwitcher type="checkbox" bind:checked={strongVerbs}>Сильные глаголы</FormSwitcher>
    {/if}

    <FormSwitcher type="checkbox" bind:checked={others}>Другое</FormSwitcher>
  {/if}

  <pre>{JSON.stringify(item, null, ' ')}</pre>

  <div class="wrap">
    {item.translation}
    <br>
    {#if visible}
      {#if item.wordType === 'noun'}
        {item.article}
      {/if}
      <span use:textInit>{item.text}</span>
      <br>

      {#if item.wordType === 'noun'}
        {item.plural}
      {/if}
    {/if}
  </div>
  <div class="buttons">
    <Button text="Показать" on:click={show} />
    <Button text="Следующий" on:click={next} />
    <Button text="Случайная буква" />
  </div>
</div>

<style>
  .learn {
    background: #ffdda7;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 60px);
  }

  .wrap {
    flex: 1;
  }

  .buttons {

  }

  .buttons :global(.button) {
    margin: 10px 0 0;
    width: 100%;
  }
</style>
