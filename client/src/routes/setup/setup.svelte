<script>
  import DocumentTitle from 'sdk/document-title/document-title.svelte';
  import SetupBox from './setup-box.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Button from 'sdk/button/button.svelte';
  import { useRoute } from 'lib/router/router';
  import { page } from 'stores';

  let setup = $page.setup;

  const onSave = () => {
    useRoute({ componentId: 'setup', routeId: 'updateSetup', payload: { ...setup }});
  };
</script>

<DocumentTitle title="setup" />

<div class="setup">
  <h1>Настройка голоса</h1>

  <FormSwitcher type="toggle" bind:checked={setup.voice}>Включить голос</FormSwitcher>
  {#if setup.voice}
    <SetupBox title="скорость" flex>
      <Button text="1" active={setup.voiceSpeed === 1} on:click={() => (setup.voiceSpeed = 1)} />
      <Button text="2" active={setup.voiceSpeed === 2} on:click={() => (setup.voiceSpeed = 2)} />
      <Button text="3" active={setup.voiceSpeed === 3} on:click={() => (setup.voiceSpeed = 3)} />
    </SetupBox>
  {/if}

  <h1>Настройка словая</h1>

  <SetupBox title="фразы">
    <FormSwitcher type="toggle" bind:checked={setup.phrases}>учить</FormSwitcher>
    {#if setup.phrases && setup.voice}
      <FormSwitcher type="toggle" bind:checked={setup.soundPhrases}>озвучивать</FormSwitcher>
    {/if}
  </SetupBox>

  <SetupBox title="существительные">
    <FormSwitcher type="toggle" bind:checked={setup.nouns}>учить</FormSwitcher>
    {#if setup.nouns}
      {#if setup.voice}
        <FormSwitcher type="toggle" bind:checked={setup.soundNouns}>озвучивать</FormSwitcher>
      {/if}

      <SetupBox title="артикли">
        <FormSwitcher type="toggle" bind:checked={setup.articles}>показывать</FormSwitcher>
        {#if setup.voice}
          <FormSwitcher type="toggle" bind:checked={setup.soundNouns}>озвучивать</FormSwitcher>
        {/if}
      </SetupBox>

      <SetupBox title="plural">
        <FormSwitcher type="toggle" bind:checked={setup.plural}>показывать</FormSwitcher>
        {#if setup.voice}
          <FormSwitcher type="toggle" bind:checked={setup.soundPlural}>озвучивать</FormSwitcher>
        {/if}
      </SetupBox>
    {/if}
  </SetupBox>

  <SetupBox title="глаголы">
    <FormSwitcher type="toggle" bind:checked={setup.verbs}>учить</FormSwitcher>
    {#if setup.verbs}
      {#if setup.voice}
        <FormSwitcher type="toggle" bind:checked={setup.soundVerbs}>озвучивать</FormSwitcher>
      {/if}

      <SetupBox title="сильные">
        <FormSwitcher type="toggle" bind:checked={setup.strongVerbs}>показывать</FormSwitcher>
        {#if setup.voice}
          <FormSwitcher type="toggle" bind:checked={setup.soundStrongVerbs}>озвучивать</FormSwitcher>
        {/if}
      </SetupBox>

      <SetupBox title="неправильные">
        <FormSwitcher type="toggle" bind:checked={setup.irregularVerbs}>показывать</FormSwitcher>
        {#if setup.voice}
          <FormSwitcher type="toggle" bind:checked={setup.soundIrregularVerbs}>озвучивать</FormSwitcher>
        {/if}
      </SetupBox>
    {/if}
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
</style>
