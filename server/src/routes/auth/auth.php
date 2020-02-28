<?php

  namespace routes;

  class Auth extends \lib\RouteComponent {
    /** @var \api\Auth */
    private $api;

    public function __construct() {
      $this->api = new \api\Auth();
    }

    public function registerUser() {
      $login = $this->getPayload('login');
      $email = $this->getPayload('email');
      $password = $this->getPayload('password'); // because we dont need to trim it

      if ($this->api->existByCredentials($login, $email)) {
        $this->setError('registration.userAlreadyExist.error');
      } else {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $this->api->register($login, $email, $passwordHash);
        $this->addMessage('registration.success');
      }
    }

    public function askForPasswordRecovery() {
      $loginOrEmail = $this->getPayload('loginOrEmail');
      $userByLoginOrEmail = $this->api->existByCredentials($loginOrEmail, $loginOrEmail);

      if (!$userByLoginOrEmail) {
        $this->setError('noSuchUser.error');
        return;
      }

      if (!isset($userByLoginOrEmail['email'])) {
        $this->setError('passwordRecovery.noEmail.error');
        return;
      }

      $this->updateState('login', $userByLoginOrEmail['login']);
      $this->addMessage('passwordRecovery.success');
      // TODO: create real recovery :)
    }
  }
