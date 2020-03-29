<script>
  export let className = '';

  import { view } from 'stores';
</script>

<div
  class={className}
  class:fly-in-from-left={$view.backwardDirection && !$view.initialState}
  class:fly-in-from-right={!$view.backwardDirection && !$view.initialState}
>
  <slot />
</div>
