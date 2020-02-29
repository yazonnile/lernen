<script>
  export let errors;

  import { slide } from 'svelte/transition';

  export const buildErrors = (errors) => {
    const result = [];

    if (Object.keys(errors).length > 1 && errors.required) {
      delete errors.required;
    }

    if (errors.type) {
      result.push(['type', `Неправильный формат данных`]);
    }

    if (errors.required) {
      result.push(['required', 'Обязательное поле']);
    }

    if (errors.between) {
      result.push(['between', `Поле должно быть от ${errors.between[0]} до ${errors.between[1]} в длинну`]);
    }

    if (errors.equal) {
      result.push(['equal', `Не угадали`]);
    }

    if (errors.match) {
      result.push(['match', `Выберите что-то`]);
    }

    return result;
  };

  const removeError = (ruleName) => {
    delete $errors[ruleName];
    $errors = { ...$errors };
  }
</script>

{#each buildErrors($errors) as [ ruleName, errorText ]}
  <div class="error" in:slide|local={{ delay: 0, duration: 400 }} on:click={() => removeError(ruleName)}>
    <span>{errorText}</span>
  </div>
{/each}

<style>
  .error {
    background: var(--redColor);
    border-radius: 3px;
    color: #fff;
    cursor: pointer;
    font-size: 12px;
    line-height: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
    overflow: hidden;
    padding: 5px 50px 5px 5px;
    position: relative;
    transition: .5s color .3s ease-in-out;
  }

  .error:hover {
    color: #f37f64;
  }

  span {
    display: inline-block;
    position: relative;
    vertical-align: top;
  }

  span::after {
    box-sizing: border-box;
    color: #fff;
    content: 'remove';
    height: 100%;
    left: 100%;
    opacity: 0;
    padding: 0 10px;
    position: absolute;
    text-align: center;
    transform: translateX(200%);
    transition-delay: .3s;
    transition-duration: .3s;
    transition-timing-function: ease-in-out;
    transition-property: opacity, transform;
    text-transform: uppercase;
    top: 0;
  }

  .error:hover span::after {
    opacity: 1;
    transform: translateX(0);
  }

  .error:hover,
  .error:hover span::after{
    transition-delay: .3s;
  }
</style>
