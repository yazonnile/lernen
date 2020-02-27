<script>
  import { data, setup } from 'stores';
  import Button from 'sdk/button/button.svelte';

  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const getWords = (data) => {
    const arr = [];
    const keys = Object.keys(data).filter(item => {
      return data[item].active;
    });

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = data[key];

      if (item.type === 'phrase' && !$setup.phrases) {
        continue;
      } else if (item.type === 'word') {
        if (!$setup.words) {
          continue;
        }

        if (item.wordType === 'noun' && !$setup.nouns) {
          continue;
        }

        if (item.wordType === 'verb' && !$setup.verbs) {
          continue;
        }
      } else if (!$setup.others) {
        continue;
      }

      arr.push(key);
    }

    return shuffle(arr);
  };

  const words = getWords($data);
  let activeIndex = 0;
  $: item = $data[words[activeIndex]];
  let visible = false;
  const show = () => {
    visible = true;
    textInit();
  };

  const next = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    visible = false;

    if (activeIndex === words.length - 1) {
      activeIndex = 0;
    } else {
      activeIndex++;
    }
  };

  const getTextToSpeech = () => {
    if (item.type === 'phrase') {
      return $setup.phrases && $setup.soundPhrases && item.text;
    }

    if (!$setup.soundWords || !$setup.words) {
      return;
    }

    if (item.wordType === 'other') {
      return item.text;
    }

    let result = '';
    if (item.wordType === 'noun') {
      if ($setup.articles && $setup.soundArticles) result += `${item.article} `;
      result += item.text;

      if ($setup.plural && $setup.soundPlural) {
        if (item.pluralOnly) {
          result += ', plural';
        } else {
          result += ', ';
          if ($setup.articles && $setup.soundArticles) result += 'die ';
          result += item.plural;
        }
      }

      return result;
    } else if (item.wordType === 'verb') {
      result += `${item.text}`;

      if ($setup.strongVerbs && $setup.soundStrongVerbs && item.strong1) {
        result += `.\n Ich ${item.strong1}. \n`;
        result += `Du ${item.strong2}.  \n`;
        result += `Er/sie/es ${item.strong3}.  \n`;
        result += `Wir ${item.strong4}.  \n`;
        result += `Ihr ${item.strong5}.  \n`;
        result += `Sie ${item.strong6}. \n`;
      }
      return result;
    }
  };

  let utterThis;
  const textInit = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const text = getTextToSpeech();
    if (!text) {
      return;
    }

    utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = 'de';
    utterThis.rate = .75;
    speechSynthesis.speak(utterThis);
  };
</script>

{#if item}
  <div class="learn">
    <div class="wrap" on:click={show}>
      <div class="item initial-item">{item.translation}</div>

      <div class="items">
        {#if item.wordType === 'noun'}
          <div class="item" class:visible>
            {#if $setup.articles}
              {item.article}
            {/if} {item.text}
          </div>

          {#if $setup.plural}
            <div class="item" class:visible>
              {#if item.pluralOnly}
                plural
              {:else}
                {#if $setup.articles}
                  die
                {/if} {item.plural}
              {/if}
            </div>
          {/if}
        {:else if item.wordType === 'verb'}
          <div class="item" class:visible>{item.text}</div>

          {#if $setup.strongVerbs && item.strong1}
            <div class="strong-table">
              <div class="item flex-row" class:visible>
                <div class="sub-item">Ich <b>{item.strong1}</b></div>
                <div class="sub-item">wir <b>{item.strong4}</b></div>
              </div>
              <div class="item flex-row" class:visible>
                <div class="sub-item">du <b>{item.strong2}</b></div>
                <div class="sub-item">ihr <b>{item.strong5}</b></div>
              </div>
              <div class="item flex-row" class:visible>
                <div class="sub-item">er/sie/es <b>{item.strong3}</b></div>
                <div class="sub-item">Sie/sie <b>{item.strong6}</b></div>
              </div>
            </div>
          {/if}
        {:else}
          <div class="item" class:visible>{item.text}</div>
        {/if}
      </div>
    </div>
    <div class="buttons">
      <Button text="Следующий" on:click={next} />
<!--      <Button text="Случайная буква" />-->
    </div>
  </div>
{:else}
  нет слов
{/if}

<style>
  .learn {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 60px);
  }

  .wrap {
    display: flex;
    flex-direction: column;
    flex: 1;
    font-size: 25px;
    line-height: 35px;
    justify-content: center;
    text-align: center;
  }

  .item {
    display: flex;
    opacity: 0;
  }

  .flex-row {
    width: 100%;
  }

  .strong-table {
    margin-top: 10px;
    width: 100%;
  }

  .strong-table .flex-row + .flex-row {
    border-top: 1px dashed var(--mainColorLight);
  }

  .strong-table .sub-item:first-child {
    border-right: 1px dashed var(--mainColorLight);
  }

  .sub-item {
    font-size: 16px;
    line-height: 21px;
    padding: 2px 5px;
    width: 50%;
  }

  .item.visible {
    opacity: 1;
  }

  .initial-item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 50%;
    opacity: 1;
  }

  .items {
    border: dashed var(--mainColorLight);
    border-width: 1px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 50%;
    flex-direction: column;
  }

  .buttons :global(.button) {
    margin-top: 10px;
  }
</style>
