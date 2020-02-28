<script>
  const init = (node) => {
    const bottomButtonsParent = document.getElementById('bottom-buttons');
    const nodes = [];
    while (node.childNodes.length > 0) {
      nodes.push(node.childNodes[0]);
      bottomButtonsParent.appendChild(node.childNodes[0]);
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

<style global>
  .bottom-buttons {
    display: flex;
    margin: 0 0 10px -10px;
  }

  .bottom-buttons .button {
    flex: 1;
    margin: 0 0 0 10px;
  }
</style>
