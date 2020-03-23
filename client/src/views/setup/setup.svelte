<script>
  import FormBox from 'sdk/form-box/form-box.svelte';
  import Page from 'sdk/page/page.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Button from 'sdk/button/button.svelte';
  import { user, messages } from 'stores';
  import speech, { play } from 'lib/speech/speech';

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
    speech.stop();
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

<Page className="setup">
  <FormBox title="голос">
    <FormSwitcher type="toggle" bind:checked={setup.voice}>Включить</FormSwitcher>

    {#if setup.voice}
      <div class="range">
        <span class="text">50%</span>
        <div class="range-holder">
          <input type="range" bind:value={setup.voiceSpeed} min="5" max="15" step=".5" list="tickmarks" on:change={onVoiceTest} />
          <i class="fake" style="width: {(setup.voiceSpeed - 5) * 10}%"></i>
        </div>
        <span class="text">150%</span>
      </div>
    {/if}
  </FormBox>

  <FormBox title="фразы">
    <FormSwitcher type="toggle" bind:checked={setup.phrases}>учить</FormSwitcher>
    {#if setup.phrases && setup.voice}
      <FormSwitcher type="toggle" bind:checked={setup.soundPhrases}>озвучивать</FormSwitcher>
    {/if}
  </FormBox>

  <FormBox title="существительные">
    <FormSwitcher type="toggle" bind:checked={setup.nouns}>учить</FormSwitcher>

    {#if setup.nouns}
      {#if setup.voice}
        <FormSwitcher type="toggle" bind:checked={setup.soundNouns}>озвучивать</FormSwitcher>
      {/if}

      <FormSwitcher type="toggle" bind:checked={setup.articles}>показывать артикли</FormSwitcher>

      {#if setup.voice && setup.articles && setup.soundNouns}
        <FormSwitcher type="toggle" bind:checked={setup.soundArticles}>озвучивать артикли</FormSwitcher>
      {/if}

      <FormSwitcher type="toggle" bind:checked={setup.plural}>показывать plural</FormSwitcher>

      {#if setup.voice && setup.plural && setup.soundNouns}
        <FormSwitcher type="toggle" bind:checked={setup.soundPlural}>озвучивать plural</FormSwitcher>
      {/if}
    {/if}
  </FormBox>


  <FormBox title="глаголы">
    <FormSwitcher type="toggle" bind:checked={setup.verbs}>учить</FormSwitcher>
    {#if setup.verbs}
      {#if setup.voice}
        <FormSwitcher type="toggle" bind:checked={setup.soundVerbs}>озвучивать</FormSwitcher>
      {/if}

      <FormSwitcher type="toggle" bind:checked={setup.strongVerbs}>показывать ильные</FormSwitcher>

      {#if setup.voice && setup.strongVerbs && setup.soundVerbs}
        <FormSwitcher type="toggle" bind:checked={setup.soundStrongVerbs}>озвучивать сильные</FormSwitcher>
      {/if}

      <FormSwitcher type="toggle" bind:checked={setup.irregularVerbs}>показывать неправильные</FormSwitcher>
      {#if setup.voice && setup.irregularVerbs && setup.soundVerbs}
        <FormSwitcher type="toggle" bind:checked={setup.soundIrregularVerbs}>озвучивать неправильные</FormSwitcher>
      {/if}
    {/if}
  </FormBox>

  <FormBox title="другое">
    <FormSwitcher type="toggle" bind:checked={setup.other}>учить</FormSwitcher>
  </FormBox>

  <div class="row">
    <Button text="Сохранить" on:click={onSave} />
  </div>
</Page>

<style>
  .setup {
    width: 100%;
  }

  .row {
    margin-top: 20px;
  }

  .range {
    align-items: center;
    display: flex;
    height: 42px;
    justify-content: center;
  }

  .range-holder {
    flex: 1;
    margin: 0 10px;
    position: relative;
  }

  .range .fake {
    background: var(--gameStandardBgContrast);
    height: 5px;
    left: 0;
    position: absolute;
    top: 8px;
  }

  .range input {
    background: var(--bgColorContrast);
    border-radius: 3px;
    height: 4px;
    outline: none;
    width: 100%;

    -webkit-appearance: none;
  }

  .range input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: var(--textColor);
    border-radius: 12px;
    cursor: pointer;
    height: 24px;
    position: relative;
    width: 24px;
    z-index: 1;
  }
</style>
