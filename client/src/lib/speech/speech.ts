const f = (text, speed) => {
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

f.stop = () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
};

export default f;
