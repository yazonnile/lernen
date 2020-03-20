<script>
  export let name;

  import * as iconComponents from './icon';
</script>

<i {...$$props} class="{`icon icon-${name}`}">
  {@html iconComponents[name + 'Icon']}
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
