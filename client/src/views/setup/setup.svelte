<script>
  import SetupBox from './setup-box.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Button from 'sdk/button/button.svelte';
  import Slide from 'sdk/transition/slide.svelte'
  import { user as userStore } from 'stores';
  import { play } from 'lib/speech/speech';

  let setup = $userStore;

  const onSave = () => {
    $userStore = setup;
    // TODO: SYNC
  };

  const onVoiceSpeedChange = (s) => {
    setup.voiceSpeed = s;
  };

  const onVoiceTest = () => {
    play(['Wie heißen Sie?'], setup.voiceSpeed);
  }
</script>

<div class="setup">
  <Button text="Сохранить" on:click={onSave} />

  <h1>Настройка голоса</h1>

  <FormSwitcher type="toggle" bind:checked={setup.voice}>Включить голос</FormSwitcher>
  <Slide active={setup.voice}>
    <Button text="проверить звук" on:click={() => onVoiceTest()} />
    <SetupBox title="скорость" flex>
      <Button text="1" active={setup.voiceSpeed === 1} on:click={() => onVoiceSpeedChange(1)} />
      <Button text="2" active={setup.voiceSpeed === 2} on:click={() => onVoiceSpeedChange(2)} />
      <Button text="3" active={setup.voiceSpeed === 3} on:click={() => onVoiceSpeedChange(3)} />
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
          <FormSwitcher type="toggle" bind:checked={setup.soundNouns}>озвучивать</FormSwitcher>
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
</style>
