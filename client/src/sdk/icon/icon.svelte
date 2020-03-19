<script>
  export let name;

  import CheckboxIcon from './files/checkbox.svelte';
  import CloseIcon from './files/close.svelte';
  import DeleteIcon from './files/delete.svelte';
  import DownIcon from './files/down.svelte';
  import EditIcon from './files/edit.svelte';
  import MenuIcon from './files/menu.svelte';
  import PlusIcon from './files/plus.svelte';
  import ProfileIcon from './files/profile.svelte';
  import TurnOffIcon from './files/turn-off.svelte';
  import TurnOnIcon from './files/turn-on.svelte';
  import UnChainIcon from './files/unchain.svelte';

  const getActiveIcon = (iconName) => {
    switch (iconName) {
      case 'checkbox': return CheckboxIcon;
      case 'close': return CloseIcon;
      case 'delete': return DeleteIcon;
      case 'down': return DownIcon;
      case 'edit': return EditIcon;
      case 'menu': return MenuIcon;
      case 'plus': return PlusIcon;
      case 'profile': return ProfileIcon;
      case 'turn-off': return TurnOffIcon;
      case 'turn-on': return TurnOnIcon;
      case 'unchain': return UnChainIcon;
    }
  };
</script>

<i {...$$props} class="{`icon icon-${name}`}">
  <svelte:component this={getActiveIcon(name)} />
</i>

<style global>
  .icon {
    display: inline-block;
    fill: currentColor;
    height: 100%;
    max-height: 100px;
    vertical-align: top;
    max-width: 100px;
    width: 100%;
  }

  .icon svg {
    display: block;
    height: 100%;
    margin: 0 auto;
    max-width: 100%;
  }
</style>
