<script>
  export let icon = null;
  export let disabled = false;
  export let text = '';
  export let type = 'button';
  export let empty = false;
  export let color = 'default';
  export let active = false;

  import Icon from 'sdk/icon/icon.svelte';
  import clickSplash from 'lib/click-splash/click-splash';
</script>

<button
  use:clickSplash
  on:click
  class="button button--color-{color}"
  class:button--icon-only="{icon && !text}"
  class:button--empty="{empty}"
  class:button--active="{active}"
  {type} {disabled}
>
  <span class="button--inner">
    {#if icon}
      <span class="button--icon"><Icon name={icon} /></span>
    {/if}

    {#if text}
      <span class="button--text">{text}</span>
    {/if}

    <slot />
  </span>
</button>

<style global>
  .button {
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    cursor: pointer;
    display: inline-block;
    font-size: 13px;
    letter-spacing: 1px;
    line-height: 40px;
    margin-right: 10px;
    min-width: 100px;
    overflow: hidden;
    padding: 3px 12px;
    position: relative;
    vertical-align: top;
    width: 100%;
  }

  .button--color-default {
    background: var(--mainColorLight);
    color: inherit;
  }

  .button--color-red {
    background: var(--redColorLight);
    color: inherit;
  }

  .button:focus {
    box-shadow: 0 0 3px 1px #000;
  }

  .button--inner {
    height: 40px;
    vertical-align: top;
    text-transform: uppercase;

    align-items: stretch;
    display: flex;
    flex-wrap: nowrap;
  }

  .button--icon {
    height: 100%;
    max-width: 28px;
    margin: 0 0 0 10px;
    padding: 4px 0;
  }

  .button--text {
    flex: 1;
    margin-right: -2px;
    overflow: hidden;
    padding: 1px 0 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .button--icon-only {
    min-width: 0;
  }

  .button--icon-only .button--icon {
    margin: 0;
  }

  .button:only-child {
    margin-right: 0;
  }
</style>
