<?php

  namespace api;

  class Users {
    public $users = [];

    public function __construct() {
      $this->users = \lib\Utils::getJSON('/api/users/users.json');
    }

    public function getUser($login, $pass) {
      $password = $this->users[$login] ?? null;
      return $pass === $password;
    }
  }
