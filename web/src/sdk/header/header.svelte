<script>
  import Icon from 'sdk/icon/icon.svelte';
  import { menu, router } from 'stores';
</script>

<header class="header">
  <button
    class="header--mobile-profile"
    on:click="{menu.showLeft}"
  ><Icon name="profile" /></button>

  <a href="/" on:click={() => router.push('/')}>Lernen</a>

  <button
    class="header--mobile-menu"
    on:click="{menu.showRight}"
  ><Icon name="menu" /></button>
</header>

<style>
  .header {
    background: #ccc;
    box-shadow: 0 -10px 10px 10px #000;
    display: flex;
    font-size: 28px;
    font-weight: bold;
    justify-content: space-between;
    line-height: 40px;
    margin-bottom: 20px;
    order: 1;
    position: relative;
    text-transform: uppercase;
    text-align: center;
  }

  .header a {
    color: inherit;
    text-decoration: none;
  }

  .header--mobile-menu,
  .header--mobile-profile {
    background: none;
    border: 0;
    color: #555;
    height: 40px;
    padding: 8px;
    width: 40px;
  }
</style>
