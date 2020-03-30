<script context="module">
  const init = (node) => {
    const nodes = [];
    while (node.childNodes.length > 0) {
      nodes.push(node.childNodes[0]);
      document.body.appendChild(node.childNodes[0]);
    }

    return {
      destroy() {
        nodes.forEach(node => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      }
    }
  };
</script>

<div use:init><slot /></div>

<style>
  div {
    display: none;
  }
</style>
