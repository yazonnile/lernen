<script>
  export let word;

  import { user, words } from 'stores';

  const strongExists = (word, setup) => {
    if (!setup.strongVerbs) {
      return false;
    }

    return words.verbIsStrong(word);
  };

  const irregularExists = (word, setup) => {
    if (!setup.irregularVerbs) {
      return false;
    }

    return words.verbIsIrregular(word);
  };
</script>

<p class="bg-row">{word.original}</p>

<div class="verb">
  {#if irregularExists(word, $user)}
    <p class="bg-row">{word.irregular1} / {word.irregular2}</p>
  {/if}
  {#if strongExists(word, $user)}
    <div class="bg-row">
      <table>
        <tr>
          <td>Ich <b>{word.strong1}</b></td>
          <td>wir <b>{word.strong4}</b></td>
        </tr>
        <tr>
          <td>du <b>{word.strong2}</b></td>
          <td>ihr <b>{word.strong5}</b></td>
        </tr>
        <tr>
          <td>er/sie/es <b>{word.strong3}</b></td>
          <td>Sie/sie <b>{word.strong6}</b></td>
        </tr>
      </table>
    </div>
  {/if}
</div>

<style>
  .verb {
    font-size: 16px;
    line-height: 21px;
  }

  .bg-row {
    background: var(--gameStandardBg);
    margin-top: 10px;
    padding: 20px;
  }

  table {
    border-collapse: collapse;
    text-align: left;
    width: 100%;
  }

  td {
    border: 0;
    padding: 10px;
    width: 50%;
  }
</style>
