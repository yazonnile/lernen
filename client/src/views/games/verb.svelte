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

<p>{word.original}</p>

<div class="verb">
  {#if strongExists(word, $user)}
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
  {/if}

  {#if irregularExists(word, $user)}
    <p>{word.irregular1} / {word.irregular2}</p>
  {/if}
</div>

<style>
  .verb {
    font-size: 16px;
    line-height: 21px;
  }

  table {
    border-collapse: collapse;
    margin-top: 10px;
    text-align: left;
    width: 100%;
  }

  td {
    border: 1px solid #fff;
    padding: 5px;
    width: 50%;
  }

  table tr:first-child td { border-top: 0; }
  table tr:last-child td { border-bottom: 0; }
  table tr td:first-child { border-left: 0; }
  table tr td:last-child { border-right: 0; }
</style>
