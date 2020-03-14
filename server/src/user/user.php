<?php

  class User extends StateManager {
    /** @var Query */
    private $query;

    /** @var Config */
    private $config;

    public function __construct($config) {
      if (!isset($_SESSION)) session_start();

      $this->config = $config;
      $this->updateState(null, []);
      $userId = $this->getUserIdFromCookies();
      $this->query = new Query();

      if ($userId) {
        $this->setupById($userId);
      }
    }

    private function getUserIdFromCookies() {
      $jwtToken = $_COOKIE[$this->config->getState('jwt.name')] ?? null;

      if (!$jwtToken) {
        return null;
      }

      $jwt = new Jwt($jwtToken);
      if (!$jwt->verifyToken($this->config->getState('jwt.salt'))) {
        return null;
      }

      $jwtData = $jwt->getData();
      $userId = $jwtData['userId'] ?? null;
      $jwtValue = $jwtData[$this->config->getState('jwt.key')] ?? null;

      if ($userId && $jwtValue === $this->config->getState('jwt.value')) {
        return $userId;
      }

      return null;
    }

    public function setupById($userId) {
      $userObj = $this->query->getUserById($userId);

      if ($userObj) {
        $this->updateState(null, $userObj);
      }
    }

    public function logout() {
      session_destroy();
      $_SESSION = [];
      $this->updateState(null, []);
      $this->removeUserCookie();
    }

    public function setUserCookie($userId) {
      $jwtKey = $this->config->getState('jwt.key');
      $jwt = new Jwt();
      $jwtToken = $jwt->generateTokenFromData([
        'userId' => $userId,
        $jwtKey => $this->config->getState('jwt.value')
      ], $this->config->getState('jwt.salt'));

      setcookie(
        $this->config->getState('jwt.name'), $jwtToken,
        time() + 60 * 60 * 24 * 30, '/', null, null, true
      );
    }

    public function removeUserCookie() {
      setcookie($this->config->getState('jwt.name'), '', 0, '/', null, null, true);
    }

    public function isLoggedIn() {
      return boolval($this->getId());
    }

    public function getId() {
      return $this->getState('userId');
    }
  }
