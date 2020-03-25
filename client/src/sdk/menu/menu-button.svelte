<script>
  export let delay;
  export let icon;

  import Icon from 'sdk/icon/icon.svelte';
  import { fly } from 'svelte/transition';
</script>

<div
  class="item"
  in:fly="{{ y: 100, opacity: 0, duration: 250, delay }}"
>
  <button on:click>
    <span class="text"><slot /></span>
    <Icon name={icon} />
  </button>
</div>

<style>
  .item {
    border-right: 2px solid var(--bgColor);
    padding: 10px 0 0;
    position: relative;
    text-align: right;
    z-index: 2;
  }

  button {
    background: none;
    border: 0;
    display: inline-flex;
    align-items: flex-end;
    flex: 1;
    margin: 0 -21px 0 0;
    text-transform: uppercase;
  }

  .text {
    color: var(--bgColor);
    display: block;
    text-shadow: 1px 1px 0 #000;
    padding: 12px 0;
  }

  button :global(.icon) {
    background: var(--bgColor);
    border-radius: 20px;
    margin-left: 10px;
    height: 40px;
    padding: 10px;
    width: 40px;
  }
</style>
