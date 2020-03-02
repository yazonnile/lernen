interface SpeechInterface {
  stop();
  sayWord(word: Word, setup: Setup);
}

const getVerbTextToSpeech = (word: Word, setup: Setup): string => {
  let result = word.original;

  if (setup.soundStrongVerbs && word.strong1) {
    result += `.\n Ich ${word.strong1}. \n`;
    result += `Du ${word.strong2}.  \n`;
    result += `Er/sie/es ${word.strong3}.  \n`;
    result += `Wir ${word.strong4}.  \n`;
    result += `Ihr ${word.strong5}.  \n`;
    result += `Sie ${word.strong6}. \n`;
  }

  if (setup.soundIrregularVerbs && word.irregular1) {
    result += `.\n ${word.irregular1}. \n ${word.irregular2}`;
  }

  return result;
};

const getNounTextToSpeech = (word: Word, setup: Setup): string => {
  let result = '';

  if (setup.soundArticles) {
    result += `${word.article} `;
  }

  result += word.original;

  if (setup.soundPlural) {
    result += ', ';
    if (word.plural) {
      if (setup.soundArticles) {
        result += 'die ';
      }

      result += word.plural;
    } else {
      result += 'plural';
    }
  }

  return result;
};

const getTextToSpeech = (word: Word, setup: Setup): string => {
  if (!setup.voice) {
    return;
  }

  switch (word.type) {
    case 'verb':
      return setup.soundVerbs && getVerbTextToSpeech(word, setup);

    case 'noun':
      return setup.soundNouns && getNounTextToSpeech(word, setup);

    case 'phrase':
      return setup.soundPhrases && word.original;

    default:
      return word.original;
  }
};

const sayText = (text: string, speed: SetupVoiceSpeed) => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  if (!text) {
    return;
  }

  const utterThis = new SpeechSynthesisUtterance(text);
  utterThis.voice = speechSynthesis.getVoices().find(i => i.lang === 'de-DE');
  utterThis.lang = 'de-DE';
  utterThis.rate = Math.min(1, .45 + .15 * speed);
  speechSynthesis.speak(utterThis);
  console.log(text);
};

const sayWord = (word: Word, setup: Setup) => {
  const text = getTextToSpeech(word, setup);
  sayText(text, setup.voiceSpeed);
};

const stop = () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
};

export default {
  stop,
  sayWord
};
