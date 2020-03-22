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
  <div class="row">
    <Button text="Сохранить" on:click={onSave} />
  </div>

  <FormSwitcher type="toggle" bind:checked={setup.voice}>Включить голос</FormSwitcher>

  {#if setup.voice}
    <div class="row">
      <Button text="проверить голос" on:click={() => onVoiceTest()} />
    </div>

    <SetupBox title="скорость голоса" flex>
      <div class="range">
        <Button text="-5%" on:click={decVoiceSpeed} />
        <h2>{setup.voiceSpeed*10}%</h2>
        <Button text="+5%" on:click={incVoiceSpeed} />
      </div>
    </SetupBox>
  {/if}

  <SetupBox title="фразы">
    <FormSwitcher type="toggle" bind:checked={setup.phrases}>учить</FormSwitcher>
    {#if setup.phrases && setup.voice}
      <FormSwitcher type="toggle" bind:checked={setup.soundPhrases}>озвучивать</FormSwitcher>
    {/if}
  </SetupBox>

  <SetupBox title="существительные">
    <FormSwitcher type="toggle" bind:checked={setup.nouns}>учить</FormSwitcher>
    {#if setup.nouns && setup.voice}
      <FormSwitcher type="toggle" bind:checked={setup.soundNouns}>озвучивать</FormSwitcher>
    {/if}
  </SetupBox>

  {#if setup.nouns}
    <SetupBox title="артикли">
      <FormSwitcher type="toggle" bind:checked={setup.articles}>показывать</FormSwitcher>
      {#if setup.voice && setup.articles && setup.soundNouns}
        <FormSwitcher type="toggle" bind:checked={setup.soundArticles}>озвучивать</FormSwitcher>
      {/if}
    </SetupBox>

    <SetupBox title="plural">
      <FormSwitcher type="toggle" bind:checked={setup.plural}>показывать</FormSwitcher>
      {#if setup.voice && setup.plural && setup.soundNouns}
        <FormSwitcher type="toggle" bind:checked={setup.soundPlural}>озвучивать</FormSwitcher>
      {/if}
    </SetupBox>
  {/if}

  <SetupBox title="глаголы">
    <FormSwitcher type="toggle" bind:checked={setup.verbs}>учить</FormSwitcher>
    {#if setup.verbs && setup.voice}
      <FormSwitcher type="toggle" bind:checked={setup.soundVerbs}>озвучивать</FormSwitcher>
    {/if}
  </SetupBox>

  {#if setup.verbs}
    <SetupBox title="сильные глаголы">
      <FormSwitcher type="toggle" bind:checked={setup.strongVerbs}>показывать</FormSwitcher>
      {#if setup.voice && setup.strongVerbs && setup.soundVerbs}
        <FormSwitcher type="toggle" bind:checked={setup.soundStrongVerbs}>озвучивать</FormSwitcher>
      {/if}
    </SetupBox>

    <SetupBox title="неправильные глаголы">
      <FormSwitcher type="toggle" bind:checked={setup.irregularVerbs}>показывать</FormSwitcher>
      {#if setup.voice && setup.irregularVerbs && setup.soundVerbs}
        <FormSwitcher type="toggle" bind:checked={setup.soundIrregularVerbs}>озвучивать</FormSwitcher>
      {/if}
    </SetupBox>
  {/if}

  <SetupBox title="другое">
    <FormSwitcher type="toggle" bind:checked={setup.other}>учить</FormSwitcher>
  </SetupBox>

  <Button text="Сохранить" on:click={onSave} />
</div>

<style>
  .setup {
    width: 100%;
  }

  .row {
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
