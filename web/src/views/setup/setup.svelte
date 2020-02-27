<script>
  import Button from 'sdk/button/button.svelte';
  import FormSwitcher from 'sdk/form-switcher/form-switcher.svelte';
  import Box from './setup-box.svelte';
  import { setup, view } from 'stores';
  import request from 'lib/request/request';

  const save = () => {
    request('/setup', { ...$setup }).then(responseData => {
      if (responseData && responseData.data) {
        $setup = responseData.data;
        view.home();
      }
    });
  };
</script>

<div class="setup">
  <Box title="Фразы">
    <div class="row">
      <FormSwitcher type="toggle" bind:checked={$setup.phrases}>учить</FormSwitcher>
      <div class="sub-row" class:visible={$setup.phrases}>
        <FormSwitcher type="checkbox" bind:checked={$setup.soundPhrases}>озвучивать</FormSwitcher>
      </div>
    </div>
  </Box>

  <Box title="Слова">
    <div class="row">
      <FormSwitcher type="toggle" bind:checked={$setup.words}>учить</FormSwitcher>
      <div class="sub-row" class:visible={$setup.words}>
        <FormSwitcher type="checkbox" bind:checked={$setup.soundWords}>озвучивать</FormSwitcher>
      </div>
    </div>

    {#if $setup.words}
      <Box title="Существительные">
        <FormSwitcher type="toggle" bind:checked={$setup.nouns}>учить</FormSwitcher>

        {#if $setup.nouns}
          <Box title="Артикли">
            <div class="row">
              <FormSwitcher type="toggle" bind:checked={$setup.articles}>показывать</FormSwitcher>
              <div class="sub-row" class:visible={$setup.articles}>
                <FormSwitcher type="checkbox" bind:checked={$setup.soundArticles}>озвучивать</FormSwitcher>
              </div>
            </div>
          </Box>

          <Box title="Plural">
            <div class="row">
              <FormSwitcher type="toggle" bind:checked={$setup.plural}>показывать</FormSwitcher>
              <div class="sub-row" class:visible={$setup.plural}>
                <FormSwitcher type="checkbox" bind:checked={$setup.soundPlural}>озвучивать</FormSwitcher>
              </div>
            </div>
          </Box>
        {/if}
      </Box>

      <Box title="Глаголы">
        <FormSwitcher type="toggle" bind:checked={$setup.verbs}>учить</FormSwitcher>
        {#if $setup.verbs}
          <Box title="Сильные">
            <div class="row">
              <FormSwitcher type="toggle" bind:checked={$setup.strongVerbs}>показывать</FormSwitcher>
              <div class="sub-row" class:visible={$setup.strongVerbs}>
                <FormSwitcher type="checkbox" bind:checked={$setup.soundStrongVerbs}>озвучивать</FormSwitcher>
              </div>
            </div>
          </Box>

          <Box title="Неправильные">
            <div class="row">
              <FormSwitcher type="toggle" bind:checked={$setup.irregularVerbs}>показывать</FormSwitcher>
              <div class="sub-row" class:visible={$setup.irregularVerbs}>
                <FormSwitcher type="checkbox" bind:checked={$setup.soundIrregularVerbs}>озвучивать</FormSwitcher>
              </div>
            </div>
          </Box>
        {/if}
      </Box>

      <Box title="Другое">
        <div class="row">
          <FormSwitcher type="toggle" bind:checked={$setup.others}>учить</FormSwitcher>
          <div class="sub-row" class:visible={$setup.others}>
            <FormSwitcher type="checkbox" bind:checked={$setup.soundOther}>озвучивать</FormSwitcher>
          </div>
        </div>
      </Box>
    {/if}
  </Box>

  <div class="buttons">
    <Button text="Сохранить" on:click={save} />
  </div>
</div>

<style>
  .setup {
    padding-top: 30px;
    width: 100%;
  }

  .row {
    display: flex;
    justify-content: space-around;
  }

  .row > :global(*) {
    flex: 1;
  }

  .sub-row {
    opacity: 0;
  }

  .sub-row.visible {
    opacity: 1;
  }

  .buttons {

  }

  .buttons :global(.button) {
    margin: 10px 0 0;
  }
</style>
