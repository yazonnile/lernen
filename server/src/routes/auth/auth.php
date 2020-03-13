<?php

  namespace routes;

  class Auth extends \lib\RouteComponent {
    /** @var \api\Auth */
    private $api;

    /** @var \api\Setup */
    private $setupApi;

    public function __construct() {
      $this->api = new \api\Auth();
      $this->setupApi = new \api\Setup();
    }

    public function registerUser() {
      $login = $this->getPayload('login');
      $password = $this->getPayload('password'); // because we dont need to trim it

      if ($this->api->existByCredentials($login)) {
        $this->setError('registration.userAlreadyExist.error');
      } else {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $this->api->register($login, $passwordHash);
        $this->addMessage('registration.success');

        $userId = $this->api->getLastInsertId();
        $this->setupApi->update('setup', [ 'userId' => $userId ]);
      }
    }

    public function logout() {
      $this->user->logout();
    }

    public function login() {
      $userId = $this->user->getUserIdByLogin();
      if ($userId) {
        $this->user->setupById($userId);
        $this->user->updateState('loggedIn', true);
      }
    }
  }
