<script>
  import { menu } from 'stores';
  import Main from 'sdk/main/main.svelte';
  import Header from 'sdk/header/header.svelte';
  import MenuPanel from 'sdk/menu-panel/menu-panel.svelte';
</script>

<Header />
<Main />

{#if $menu.right}
  <MenuPanel direction="right">
    RIGHT
  </MenuPanel>
{/if}

{#if $menu.left}
  <MenuPanel>
    LEFT
  </MenuPanel>
{/if}
