<?php

class App extends StateManager {
  /** @var Request */
  private $request;

  /** @var Response */
  private $response;

  /** @var Config */
  private $config;

  /** @var User */
  private $user;

  /** @var Query */
  private $query;

  public function __construct() {
    $this->request = new Request();
    $this->config = new Config();
    $this->user = new User($this->config);
    $isDebug = true;

    if ($this->request->isGet()) {
      $this->updateState('validationRules', Validation::collectRules());
      echo preg_replace([
        '/{{% HOST %}}/',
        '/{{% DATA %}}/',
      ], [
        $isDebug ? '//localhost:4000/' : '',
        base64_encode(json_encode($this->getState(), JSON_NUMERIC_CHECK)),
      ], file_get_contents(__DIR__ . '/../view/index.html'));
      return;
    }

    $apiId = $this->decode('api');
    if (!method_exists($this, $apiId)) {
      $this->exitWithErrorMessage('actionDoesntExist.error', [$apiId]);
      return;
    }

    $this->request->updateState(null, [
      'payload' => $this->decode('payload')
    ]);

    $this->response = new Response();
    $this->query = new Query();
    $this->$apiId();
    $this->result();
  }

  private function validateData($data, $scheme) {
    $errors = Validation::validateData($data, $scheme);

    if (count($errors)) {
      $this->exitWithErrorMessage('validation.error', $errors);
    }
  }

  private function exitWithErrorMessage($error, $errorData = []) {
    $this->response->addErrorMessage($error, $errorData);
    $this->result();
    exit();
  }

  private function exitWithError($errorData = []) {
    $this->response->addError($errorData);
    $this->result();
    exit();
  }

  private function decode($key) {
    try {
      return json_decode($_POST[$key], true);
    } catch (\Exception $e) {
      $this->exitWithErrorMessage('parse.error', $e->getMessage());
    }

    return [];
  }

  private function result() {
    header('Content-Type: application/json');
    echo json_encode(array_merge(
      $this->getState(),
      $this->response->getState(),
      ['user' => $this->user->getState()]
    ), JSON_NUMERIC_CHECK);
  }

  private function registerUser() {
    if ($this->user->isLoggedIn()) {
      $this->exitWithErrorMessage('access');
      return;
    }

    $this->validateData(
      $this->request->getState('payload'),
      ['login', 'password', 'mcnulty']
    );

    $login = $this->request->getState('payload.login');
    $password = $this->request->getState('payload.password');

    if ($this->query->isLoginAlreadyExists($login)) {
      $this->exitWithErrorMessage('registration.userAlreadyExist.error');
    } else {
      $passwordHash = password_hash($password, PASSWORD_DEFAULT);
      $this->query->registerUser($login, $passwordHash);
      $this->response->addMessage('registration.success');
    }
  }

  private function loginUser() {
    $this->validateData(
      $this->request->getState('payload.login'),
      ['login', 'password']
    );

    $login = $this->request->getState('payload.login.login');
    $password = $this->request->getState('payload.login.password');

    $userByLogin = $this->query->getUserByLogin($login);

    if (!$userByLogin) {
      $this->exitWithErrorMessage('noSuchUser.error');
      return;
    }

    if (!password_verify($password, $userByLogin['password'])) {
      $this->exitWithErrorMessage('login.error');
      return;
    }

    if (password_needs_rehash($userByLogin['password'], PASSWORD_DEFAULT)) {
      $this->query->updatePassword($userByLogin['userId'], password_hash($password, PASSWORD_DEFAULT));
    }

    $this->response->addMessage('login.success');
    $userId = $userByLogin['userId'];
    $this->user->setUserCookie($userId);
    $this->user->setupById($userId);
  }

  private function logoutUser() {
    if (!$this->user->isLoggedIn()) {
      $this->exitWithErrorMessage('access');
      return;
    }

    $this->user->logout();
  }

  private function getInitialData() {
    if (!$this->user->isLoggedIn()) {
      if ($this->request->getState('payload.login')) {
        $this->loginUser();
      }
    }

    if (!$this->user->isLoggedIn()) {
      $this->exitWithError();
      return;
    }

    $this->syncData(false);
    $userId = $this->user->getId();

    // get words
    $initialWords = array_reduce($this->query->getWordsByUserId($userId), function($carry, $word) {
      $carry[$word['wordId']] = array_merge($word, [
        'categories' => is_null($word['categories']) ? [] : explode(',', $word['categories'])
      ]);
      return $carry;
    }, []);

    if (count($initialWords)) {
      $this->updateState('words', $initialWords);
    }

    // get categories
    $initialCategories = array_reduce($this->query->getCategoriesByUserId($userId), function($carry, $row) {
      $carry[$row['categoryId']] = $row;
      return $carry;
    }, []);

    if (count($initialCategories)) {
      $this->updateState('categories', $initialCategories);
    }

    // get user setup
    $this->user->setupById($this->user->getId());
    $this->updateState('user', $this->user->getState());
  }

  private function syncData($originalRequest = true) {
    if ($originalRequest) {
      if (!$this->user->isLoggedIn()) {
        $this->exitWithErrorMessage('access');
        return;
      }
    }

    $syncManager = new SyncManager($this->request->getState('payload'), $this->query, $this->user->getId());
    $this->updateState('syncResult', $syncManager->getState());
  }
}
