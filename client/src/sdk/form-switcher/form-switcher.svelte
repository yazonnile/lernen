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

  <span class="form-switcher--label"><slot /></span>

  <i class="form-switcher--fake-element form-switcher--{type}">
    <i class="form-switcher--icon">
      {#if type === 'checkbox'}<Icon name="checkbox" />{/if}
    </i>
  </i>
</label>

<style global>
  .form-switcher {
    align-items: center;
    cursor: pointer;
    display: flex;
    margin-bottom: 20px;
    position: relative;
  }

  .form-switcher:last-child {
    margin-bottom: 0;
  }

  .form-switcher--real-element {
    position: absolute;
    visibility: hidden;
    z-index: -9;
  }

  .form-switcher--label {
    flex: 1;
    padding-right: 10px;
  }

  .form-switcher--toggle {
    background: #ccc;
    border-radius: 14px;
    display: inline-block;
    flex: 0 0 52px;
    height: 28px;
    min-width: 22px;
    position: relative;
    transition: background 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    vertical-align: top;
    width: 48px;
  }

  .form-switcher--toggle .form-switcher--icon {
    background: #fff;
    border-radius: 12px;
    display: block;
    height: 24px;
    left: 4px;
    position: absolute;
    transform: translateX(-2px);
    top: 2px;
    width: 24px;
    transition-duration: 0.25s;
    transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
    transition-property: transform, background;
  }

  .form-switcher--real-element:checked ~ .form-switcher--toggle {
    background: var(--textColor);
  }

  .form-switcher--real-element:checked ~ .form-switcher--toggle .form-switcher--icon {
    background: #fff;
    transform: translateX(22px);
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
