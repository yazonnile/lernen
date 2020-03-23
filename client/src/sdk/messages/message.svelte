<script context="module">
  const data = {
    'registration.success': 'Новый аккаунт создан. Осталось лишь войти в него',
    'login.success': 'Вы вошли в свой аккаунт',
    'wordEdit.success': 'Слово обновлено',
    'wordCreate.success': 'Слово создано',
    'wordExists.error': 'Такое слово уже есть',
    'setupSave.success': 'Настройки сохранены',
    'registration.userAlreadyExist.error': 'Пользователь с таким именем уже существует',
    'noSuchUser.error': 'Пользователя с таким именем нет',
    'login.error': 'Неправильный пароль',
  };
</script>

<script>
  export let id;
  export let text;
  export let status;
  export let persistent = false;

  import Icon from 'sdk/icon/icon.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import { messages } from 'stores';


  let timer;
  const clearMessage = () => {
    clearTimeout(timer);
    messages.clearById(id);
  };

  onMount(() => {
    if (!persistent) {
      timer = setTimeout(clearMessage, 5000);
    }
  });

  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

<span
  class={`message message--${status}`}
  on:click={clearMessage}
  transition:slide|local="{{ duration: 300 }}"
>
  <span class="text">
    {data[text] || text}
  </span>

  <Icon name="close" />
</span>

<style>
  .message {
    align-items: center;
    background: var(--gameStandardBgContrast);
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    padding: 25px;
    position: relative;
    word-wrap: break-word;
  }

  .message:first-child {
    margin-top: 0;
  }

  .message--success {
    background: var(--gameTranslationFirstContrast);
  }

  .message--error {
    background: var(--buttonRedContrast);
  }

  .message span {
    flex: 1;
  }

  .message :global(.icon) {
    flex: 0 0 10px;
    height: 10px;
    margin-left: 10px;
    width: 10px;
    z-index: 1;

  }
</style>
