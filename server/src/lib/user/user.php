<?php

  namespace lib;

  class User extends Component {
    /** @var \api\Auth */
    private $api;

    public function setup() {
      if (!isset($_SESSION)) session_start();

      $this->api = new \api\Auth();
      $this->updateState(null, []);

      $userId = $this->getUserIdFromCookies();
      if ($userId) {
        if ($this->getPayload('logout')) {
          $this->logoutUser();
          $userId = null;
        }
      } else {
        $userId = $this->getUserIdByLogin();
      }

      if ($userId) {
        $this->setupById($userId);
      }
    }

    private function logoutUser() {
      session_destroy();
      $_SESSION = [];
      $this->updateState(null, []);
      $this->removeUserCookie();
    }

    private function getUserIdFromCookies() {
      $jwtToken = $_COOKIE[$this->getConfigState('jwt.name')] ?? null;

      if (!$jwtToken) {
        return null;
      }

      $jwt = new Jwt($jwtToken);
      if (!$jwt->verifyToken($this->getConfigState('jwt.salt'))) {
        return null;
      }

      $jwtData = $jwt->getData();
      $userId = $jwtData['userId'] ?? null;
      $jwtValue = $jwtData[$this->getConfigState('jwt.key')] ?? null;

      if ($userId && $jwtValue === $this->getConfigState('jwt.value') && $this->api->existById($userId)) {
        return $userId;
      }

      return null;
    }

    private function getUserIdByLogin() {
      // there is no login attempt - so do nothing
      if (!$this->getPayload('loginOrEmail') || !$this->getPayload('password')) {
        return null;
      }

      // validate login data
      $payload = $this->getPayload();
      $errors = Validation::validateData($payload, [
        'loginOrEmail',
        'password'
      ]);

      if (count($errors)) {
        $this->setError('validationError', $errors);
        return null;
      }

      $loginOrEmail = $payload['loginOrEmail'];
      $password = $payload['password'];
      $userByLoginOrEmail = $this->api->getByLoginOrEmail($loginOrEmail);

      if (!$userByLoginOrEmail) {
        $this->setError('noSuchUser.error');
        return null;
      }

      if (!password_verify($password, $userByLoginOrEmail['password'])) {
        $this->setError('login.error');
        return null;
      }

      if (password_needs_rehash($userByLoginOrEmail['password'], PASSWORD_DEFAULT)) {
        $this->api->updatePassword($userByLoginOrEmail['userId'], password_hash($password, PASSWORD_DEFAULT));
      }

      $userId = $userByLoginOrEmail['userId'];
      $this->setUserCookie($userId);
      $this->updateState('login', true);
      return $userId;
    }

    private function setUserCookie($userId) {
      $jwtKey = $this->getConfigState('jwt.key');
      $jwt = new Jwt();
      $jwtToken = $jwt->generateTokenFromData([
        'userId' => $userId,
        $jwtKey => $this->getConfigState('jwt.value')
      ], $this->getConfigState('jwt.salt'));

      setcookie(
        $this->getConfigState('jwt.name'), $jwtToken,
        time() + 60 * 60 * 24 * 30, '/', null, null, true
      );
    }

    private function removeUserCookie() {
      setcookie($this->getConfigState('jwt.name'), '', 0, '/', null, null, true);
    }

    private function setupById($userId) {
      $userObj = $this->api->getById($userId);
      if ($userObj) {
        // update last visit time in DB and client
        $lastVisitDate = time();
        $this->api->updateLastVisitDate($userId, $lastVisitDate);
        $userObj['lastVisitDate'] = $lastVisitDate;

        $this->updateState(null, $userObj);
      }
    }

    public function isLoggedIn() {
      return boolval($this->getId());
    }

    public function updateState($keys, $f) {
      parent::updateState('persistentData.user' . ($keys ? '.'.$keys : ''), $f);
    }

    public function getState($keys = null) {
      return parent::getState('persistentData.user' . ($keys ? '.'.$keys : ''));
    }

    public function getId() {
      return $this->getState('userId');
    }
  }
