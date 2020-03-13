<script>
  import Icon from 'sdk/icon/icon.svelte';
</script>

<header class="header">
  <a
    href="/"
    class="logo"
    on:click|preventDefault
  >
    <span class="black">le</span>
    <span class="red">rn</span>
    <span class="yellow">en</span>
  </a>

  <button
    class="header--button"
    on:click|preventDefault
  >
    <Icon name="menu" />
  </button>
</header>

<style>
  .header {
    background: var(--mainColor);
    box-shadow: 0 -10px 10px 10px #000;
    position: relative;
    text-align: center;
  }

  .header .logo {
    color: inherit;
    display: inline-flex;
    font-size: 28px;
    font-weight: bold;
    height: 40px;
    overflow: hidden;
    padding: 0 10px;
    line-height: 40px;
    text-transform: uppercase;
    text-decoration: none;
    vertical-align: top;
  }

  .header--button {
    background: none;
    border: 0;
    height: 40px;
    padding: 8px;
    position: absolute;
    right: 0;
    top: 0;
    width: 40px;
  }

  .logo span {
    display: block;
    text-shadow: 1px 1px 1px rgba(0,0,0,1), -1px -1px 1px rgba(0,0,0,1);
  }

  .black {
    color: #424242;
  }

  .red {
    color: #de0000;
  }

  .yellow {
    color: #f7b800;
  }
</style>
