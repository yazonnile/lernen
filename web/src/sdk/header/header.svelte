<script>
  import { view } from 'stores';
</script>

<header class="header">
  <a href="/" on:click|preventDefault={view.home}>Lernen</a>
</header>

<style>
  .header {
    background: #ccc;
    box-shadow: 0 -10px 10px 10px #000;
    font-size: 28px;
    font-weight: bold;
    line-height: 40px;
    position: relative;
    text-transform: uppercase;
    text-align: center;
  }

  .header a {
    color: inherit;
    text-decoration: none;
  }
</style>
