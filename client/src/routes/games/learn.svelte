<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import BottomButtons from 'sdk/bottom-buttons/bottom-buttons.svelte';
  import Button from 'sdk/button/button.svelte';
  import speech from 'lib/speech/speech';
  import { page } from 'stores';

  let translationVisible = false;
  let activeIndex = 0;
  let words = $page.learn;
  let setup = $page.setup;
  let activeItem = $page.learn[0];
  $: activeItem = words[activeIndex];

  const showTranslation = () => {
    translationVisible = true;
    speech(getTextToSpeech(), setup.voiceSpeed);
  };

  const getVerbTextToSpeech = () => {
    let result = activeItem.original;

    if (setup.soundStrongVerbs && activeItem.strong1) {
      result += `.\n Ich ${activeItem.strong1}. \n`;
      result += `Du ${activeItem.strong2}.  \n`;
      result += `Er/sie/es ${activeItem.strong3}.  \n`;
      result += `Wir ${activeItem.strong4}.  \n`;
      result += `Ihr ${activeItem.strong5}.  \n`;
      result += `Sie ${activeItem.strong6}. \n`;
    }

    if (setup.soundIrregularVerbs && activeItem.irregular1) {
      result += `.\n ${activeItem.irregular1}. \n ${activeItem.irregular2}`;
    }

    return result;
  };

  const getNounTextToSpeech = () => {
    let result = '';

    if (setup.soundArticles) {
      result += `${activeItem.article} `;
    }

    result += activeItem.original;

    if (setup.soundPlural) {
      result += ', ';
      if (activeItem.plural) {
        if (setup.soundArticles) {
          result += 'die ';
        }

        result += activeItem.plural;
      } else {
        result += 'plural';
      }
    }

    return result;
  };

  const getTextToSpeech = () => {
    if (!setup.voice) {
      return;
    }

    switch (activeItem.type) {
      case 'verb':
      return setup.soundVerbs && getVerbTextToSpeech();

      case 'noun':
      return setup.soundNouns && getNounTextToSpeech();

      case 'phrase':
      return setup.soundPhrases && activeItem.original;

      default:
      return activeItem.original;
    }
  };

  const nextWord =  () => {
    speech.stop();
    translationVisible = false;
    activeIndex = activeIndex === words.length - 1 ? 0 : (activeIndex + 1);
  };
</script>

<DocumentTitle title="Learn" />

{#if !words.length}
  нет слов
{:else}
  <div class="learn" on:click={showTranslation}>
    <div class="item initial-item">{activeItem.translation}</div>

    <div class="item">
      {activeItem.original}
    </div>

    <BottomButtons>
      <Button text="Следующий" on:click={nextWord} />
    </BottomButtons>
  </div>
{/if}

<style>

</style>
