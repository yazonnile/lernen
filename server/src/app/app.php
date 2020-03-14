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

      if ($this->request->isGet()) {
        if ($this->user->isLoggedIn()) {
          $this->updateState('user', $this->user->getState());
        }

        $this->updateState('validationRules', Validation::collectRules());
        echo preg_replace([
          '/{{% HOST %}}/',
          '/{{% DATA %}}/',
        ], [
          '//localhost:4000',
          base64_encode(json_encode($this->getState(), JSON_NUMERIC_CHECK)),
        ], Utils::getFile('/view/index.html'));
        return;
      }

      $apiId = $this->decode('api');
      if (!method_exists($this, $apiId)) {
        $this->exitWithError('actionDoesntExist.error', [$apiId]);
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
        $this->exitWithError('validation.error', $errors);
      }
    }

    private function exitWithError($error, $errorData = []) {
      $this->response->addErrorMessage($error, $errorData);
      $this->result();
      exit();
    }

    private function decode($key) {
      try {
        return json_decode($_POST[$key], true);
      } catch (\Exception $e) {
        $this->exitWithError('parse.error', $e->getMessage());
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
        $this->exitWithError('access');
        return;
      }

      $this->validateData(
        $this->request->getState('payload'),
        ['login', 'password', 'mcnulty']
      );

      $login = $this->request->getState('payload.login');
      $password = $this->request->getState('payload.password');

      if ($this->query->isLoginAlreadyExists($login)) {
        $this->exitWithError('registration.userAlreadyExist.error');
      } else {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $this->query->registerUser($login, $passwordHash);
        $this->response->addMessage('registration.success');

        $userId = $this->query->getLastInsertId();
        $this->query->update('setup', [ 'userId' => $userId ]);
      }
    }

    private function loginUser() {
      if ($this->user->isLoggedIn()) {
        $this->exitWithError('access');
        return;
      }

      $this->validateData(
        $this->request->getState('payload'),
        ['login', 'password']
      );

      $login = $this->request->getState('payload.login');
      $password = $this->request->getState('payload.password');

      $userByLogin = $this->query->getUserByLogin($login);

      if (!$userByLogin) {
        $this->exitWithError('noSuchUser.error');
        return;
      }

      if (!password_verify($password, $userByLogin['password'])) {
        $this->exitWithError('login.error');
        return;
      }

      if (password_needs_rehash($userByLogin['password'], PASSWORD_DEFAULT)) {
        $this->query->updatePassword($userByLogin['userId'], password_hash($password, PASSWORD_DEFAULT));
      }

      $userId = $userByLogin['userId'];
      $this->user->setUserCookie($userId);
      $this->user->setupById($userId);
    }

    private function logoutUser() {
      if (!$this->user->isLoggedIn()) {
        $this->exitWithError('access');
        return;
      }

      $this->user->logout();
    }

    private function getInitialData() {
      $userId = $this->user->getId();

      // get words
      $this->updateState('words', array_reduce($this->query->getWordsByUserId($userId), function($carry, $word) {
        $carry[$word['wordId']] = $word;
        return $carry;
      }, []));

      // get categories
      $this->updateState('categories', array_reduce($this->query->getCategoriesByUserId($userId), function($carry, $row) {
        $catId = $row['categoryId'];
        if (!isset($carry[$catId])) {
          $carry[$catId] = [
            'categoryName' => $row['categoryName'],
            'categoryId' => $catId,
            'words' => []
          ];
        }

        if ($row['wordId']) {
          $carry[$catId]['words'][] = $row['wordId'];
        }
        return $carry;
      }, []));
    }

    private function sync() {
      if (!$this->user->isLoggedIn()) {
        $this->exitWithError('access');
        return;
      }

      // validate data
    }
  }
