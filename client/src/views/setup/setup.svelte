<script>
  import SetupBox from './setup-box.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Button from 'sdk/button/button.svelte';
  import Slide from 'sdk/transition/slide.svelte'
  import { user, messages } from 'stores';
  import { play } from 'lib/speech/speech';

  let setup = $user;

  const onSave = () => {
    user.saveSetup(setup);

    messages.addMessage({
      status: 'success',
      text: 'setupSave.success'
    });
  };

  const onVoiceSpeedChange = (s) => {
    setup.voiceSpeed = s;
  };

  const onVoiceTest = () => {
    play(['Wie heißen Sie?'], setup.voiceSpeed);
  };

  const incVoiceSpeed = () => {
    if (setup.voiceSpeed === 15) {
      return;
    }

    setup.voiceSpeed += .5;
  };

  const decVoiceSpeed = () => {
    if (setup.voiceSpeed === 5) {
      return;
    }

    setup.voiceSpeed -= .5;
  };
</script>

<div class="setup">
  <Button text="Сохранить" on:click={onSave} />

  <h1>Настройка голоса</h1>

  <FormSwitcher type="toggle" bind:checked={setup.voice}>Включить голос</FormSwitcher>
  <Slide active={setup.voice}>
    <Button text="проверить голос" on:click={() => onVoiceTest()} />
    <SetupBox title="скорость голоса" flex>
      <div class="range">
        <Button text="-5%" on:click={decVoiceSpeed} />
        <h2>{setup.voiceSpeed*10}%</h2>
        <Button text="+5%" on:click={incVoiceSpeed} />
      </div>
    </SetupBox>
  </Slide>

  <h1>Настройка словая</h1>

  <SetupBox title="фразы">
    <FormSwitcher type="toggle" bind:checked={setup.phrases}>учить</FormSwitcher>
    <Slide active={setup.phrases && setup.voice}>
      <FormSwitcher type="toggle" bind:checked={setup.soundPhrases}>озвучивать</FormSwitcher>
    </Slide>
  </SetupBox>

  <SetupBox title="существительные">
    <FormSwitcher type="toggle" bind:checked={setup.nouns}>учить</FormSwitcher>
    <Slide active={setup.nouns}>
      <Slide active={setup.voice}>
        <FormSwitcher type="toggle" bind:checked={setup.soundNouns}>озвучивать</FormSwitcher>
      </Slide>

      <SetupBox title="артикли">
        <FormSwitcher type="toggle" bind:checked={setup.articles}>показывать</FormSwitcher>
        <Slide active={setup.voice}>
          <FormSwitcher type="toggle" bind:checked={setup.soundArticles}>озвучивать</FormSwitcher>
        </Slide>
      </SetupBox>

      <SetupBox title="plural">
        <FormSwitcher type="toggle" bind:checked={setup.plural}>показывать</FormSwitcher>
        <Slide active={setup.voice}>
          <FormSwitcher type="toggle" bind:checked={setup.soundPlural}>озвучивать</FormSwitcher>
        </Slide>
      </SetupBox>
    </Slide>
  </SetupBox>

  <SetupBox title="глаголы">
    <FormSwitcher type="toggle" bind:checked={setup.verbs}>учить</FormSwitcher>
    <Slide active={setup.verbs}>
      <Slide active={setup.voice}>
        <FormSwitcher type="toggle" bind:checked={setup.soundVerbs}>озвучивать</FormSwitcher>
      </Slide>

      <SetupBox title="сильные">
        <FormSwitcher type="toggle" bind:checked={setup.strongVerbs}>показывать</FormSwitcher>
        <Slide active={setup.voice}>
          <FormSwitcher type="toggle" bind:checked={setup.soundStrongVerbs}>озвучивать</FormSwitcher>
        </Slide>
      </SetupBox>

      <SetupBox title="неправильные">
        <FormSwitcher type="toggle" bind:checked={setup.irregularVerbs}>показывать</FormSwitcher>
        <Slide active={setup.voice}>
          <FormSwitcher type="toggle" bind:checked={setup.soundIrregularVerbs}>озвучивать</FormSwitcher>
        </Slide>
      </SetupBox>
    </Slide>
  </SetupBox>

  <SetupBox title="другое">
    <FormSwitcher type="toggle" bind:checked={setup.other}>учить</FormSwitcher>
  </SetupBox>

  <Button text="Сохранить" on:click={onSave} />
</div>

<style>
  .setup {
    width: 100%;
  }

  .setup :global(.button) {
    margin-bottom: 20px;
  }

  .range {
    display: flex;
    align-items: center;
    margin-right: 10px;
    position: relative;
  }

  .range :global(.button) {
    font-size: 15px;
    margin: 0;
  }

  .range h2 {
    min-width: 100px;
    text-align: center;
  }
</style>
