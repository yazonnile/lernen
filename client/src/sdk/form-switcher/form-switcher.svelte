<script>
  export let type;
  export let name = null;
  export let checked = false;

  import Icon from 'sdk/icon/icon.svelte';
</script>

<label class="form-switcher">
  {#if name}
    <input {name} type="hidden" value={checked} />
  {/if}

  <input
    bind:checked
    class="form-switcher--real-element"
    type="checkbox"
  />

  <i class="form-switcher--fake-element form-switcher--{type}">
    <i class="form-switcher--icon">
      {#if type === 'checkbox'}<Icon name="checkbox" />{/if}
    </i>
  </i>

  <span class="form-switcher--label"><slot /></span>
</label>

<style global>
  .form-switcher {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-items: flex-start;
    margin-bottom: 20px;
    position: relative;
  }

  .form-switcher--real-element {
    position: absolute;
    visibility: hidden;
    z-index: -9;
  }

  .form-switcher--label {
    margin-left: 10px;
  }

  .form-switcher--toggle {
    background: #ccc;
    border-radius: 13px;
    display: inline-block;
    height: 20px;
    min-width: 42px;
    position: relative;
    transition: background 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    vertical-align: top;
    width: 42px;
  }

  .form-switcher--toggle .form-switcher--icon {
    background: #fff;
    border-radius: 10px;
    display: block;
    height: 14px;
    left: 5px;
    position: absolute;
    transform: translateX(-1px);
    top: 3px;
    width: 14px;
    transition-duration: 0.25s;
    transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
    transition-property: transform, background;
  }

  .form-switcher--real-element:checked ~ .form-switcher--toggle {
    background: var(--mainColor);
  }

  .form-switcher--real-element:checked ~ .form-switcher--toggle .form-switcher--icon {
    background: #fff;
    transform: translateX(18px);
  }

  .form-switcher--checkbox {
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 2px;
    color: var(--mainColor);
    display: block;
    height: 16px;
    transition: border-color 0.25s ease;
    width: 16px;
  }

  .form-switcher--real-element:checked ~ .form-switcher--checkbox {
    border-color: var(--mainColorLight);
  }

  .form-switcher--checkbox .form-switcher--icon {
    display: inline-block;
    height: 100%;
    opacity: 0;
    position: relative;
    transform: scale(0.1);
    transition-duration: 0.25s;
    transition-timing-function: cubic-bezier(0.45, -0.67, 0.53, 2);
    transition-property: transform, opacity;
    vertical-align: top;
    width: 100%;
  }

  .form-switcher--real-element:checked ~ .form-switcher--checkbox .form-switcher--icon {
    opacity: 1;
    transform: scale(1);
  }
</style>
