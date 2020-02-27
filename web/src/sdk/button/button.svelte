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
    letter-spacing: 2px;
    line-height: 40px;
    margin-right: 10px;
    min-width: 100px;
    overflow: hidden;
    padding: 3px 12px;
    position: relative;
    vertical-align: top;
  }

  .button--color-default {
    background: #fff;
    color: #000;
    border-color: #000;
  }

  .button--color-primary {
    background: #fff;
    color: var(--mainColor);
    border-color: var(--mainColor);
  }

  .button--color-red {
    background: #fff;
    color: var(--redColor);
    border-color: var(--redColor);
  }

  .button--active {
    border-color: transparent;
    color: #fff;
  }

  .button--active.button--color-default {
    background: #000;
  }

  .button--active.button--color-primary {
    background: var(--mainColor);
  }

  .button--active.button--color-red {
    background: var(--redColor);
  }

  .button--empty {
    border-color: transparent;
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
    margin-right: -2px;
    padding: 1px 0 0;
    flex: 1;
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
