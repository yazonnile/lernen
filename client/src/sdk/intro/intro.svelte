<script>
  export let introActive;
  export let introToHide;
  export let dataReady;

  import { onMount } from 'svelte';

  let letters = false;

  onMount(() => {
    setTimeout(() => {
      letters = true;

      const introInterval = setInterval(() => {
        if (dataReady) {
          clearInterval(introInterval);
          introToHide = true;
          setTimeout(() => {
            introActive = false;
          }, 510);
        }
      }, 4000);
    }, 1);
  });
</script>

<div class="intro" class:letters class:introToHide>
  <div class="intro--wrap">
    <i class="l">l</i>
    <i class="e1">e</i>
    <i class="r">r</i>
    <i class="n1">n</i>
    <i class="e2">e</i>
    <i class="n2">n</i>
  </div>
</div>

<style>
  .intro {
    background: #fff;
    align-items: center;
    display: flex;
    height: 100%;
    left: 0;
    justify-content: center;
    position: absolute;
    text-transform: uppercase;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  .intro--wrap {
    display: flex;
    font-size: 60px;
    line-height: 70px;
  }

  .introToHide {
    opacity: 0;
    transition: opacity .5s ease-in-out;
  }

  .intro--wrap i {
    font-style: normal;
    animation-timing-function: ease-in-out;
    animation-duration: 3s;
    animation-iteration-count: infinite;
  }

  .l, .e1 { color: #424242; }
  .r, .n1 { color: var(--redColor); }
  .e2, .n2 { color: var(--yellowColor); }

  .l { animation-delay: 1s; }
  .e1 { animation-delay: 1.1s; }
  .r { animation-delay: 1.2s; }
  .n1 { animation-delay: 1.3s; }
  .e2 { animation-delay: 1.4s; }
  .n2 { animation-delay: 1.5s; }

  .letters .intro--wrap i {
    animation-name: lettersAnim;
  }

  @keyframes lettersAnim {
    0% { transform: translateY(0); }
    25% { transform: translateY(-50%); }
    50% { transform: translateY(0); }
    100% { transform: translateY(0); }
  }

</style>
