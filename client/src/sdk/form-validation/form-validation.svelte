<script>
  export let form;
  export let className = '';

  const { onSuccess, use } = form;
</script>

<form use:use={{ onSuccess }} class={className} on:submit|preventDefault novalidate>
  <slot />
</form>
