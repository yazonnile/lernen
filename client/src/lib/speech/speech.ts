const getVerbTextToSpeech = (word: Word, setup: Setup): string[] => {
  let result = [word.original];

  if (setup.soundStrongVerbs && word.strong1) {
    result.push(null, `Ich ${word.strong1}`);
    result.push(null, `Du ${word.strong2}`);
    result.push(null, `Er/sie/es ${word.strong3}`);
    result.push(null, `Wir ${word.strong4}`);
    result.push(null, `Ihr ${word.strong5}`);
    result.push(null, `Sie ${word.strong6}`);
  }

  if (setup.soundIrregularVerbs && word.irregular1) {
    result.push(null, word.irregular1);
    result.push(null, word.irregular2);
  }

  return result;
};

const getNounTextToSpeech = (word: Word, setup: Setup): string[] => {
  let result = setup.soundArticles ? [`${word.article} ${word.original}`] : [word.original];

  if (setup.soundPlural) {
    result.push(null);
    if (word.plural) {
      result.push(setup.soundArticles ? `die ${word.plural}` : word.plural);
    } else {
      result.push('plural');
    }
  }

  return result;
};

const getTextArray = (word: Word, setup: Setup): string[]|void => {
  if (!setup.voice) {
    return;
  }

  switch (word.type) {
    case 'verb':
      return setup.soundVerbs && getVerbTextToSpeech(word, setup);

    case 'noun':
      return setup.soundNouns && getNounTextToSpeech(word, setup);

    case 'phrase':
      return setup.soundPhrases && [word.original];

    default:
      return [word.original];
  }
};

const pronouncing = {
  stop() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  },
  start(text: string, speed: SetupVoiceSpeed, callback) {
    this.stop();

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = speechSynthesis.getVoices().find(i => i.lang === 'de-DE');
    utterThis.lang = 'de-DE';
    utterThis.rate = Math.min(1, .40 + .20 * speed);
    speechSynthesis.speak(utterThis);
    utterThis.addEventListener('end', callback);
  }
};

const playNext = (textArray: string[], setup: Setup) => {
  const text = textArray.shift();

  if (text === null) {
    playNext(textArray, setup);
    return;
  }

  pronouncing.start(text, setup.voiceSpeed, () => {
    playNext(textArray, setup);
  });
};

export default {
  sayWord(word: Word, setup: Setup) {
    const textArray = getTextArray(word, setup);

    if (!textArray) {
      return;
    }

    playNext(textArray, setup);
  },
  stop() {
    pronouncing.stop();
  }
}

