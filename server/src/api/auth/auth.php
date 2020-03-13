<?php

  namespace api;

  class Auth extends \lib\Db {
    public function register($login, $password) {
      $this->setSql(
        "INSERT INTO users

        SET
          login = :login,
          password = :password;"
      )->insertData([
        ':login' => $login,
        ':password' => $password
      ]);

      return $this->getLastInsertId();
    }

    public function existByCredentials($login) {
      return $this->setSql(
        "SELECT userId, login
        FROM users
        WHERE login = :login
        LIMIT 1;"
      )->getRow([
        ':login' => $login
      ]);
    }

    public function existById($userId) {
      return $this->setSql(
        "SELECT userId
        FROM users
        WHERE userId = :userId
        LIMIT 1;"
      )->getValue([
        ':userId' => $userId
      ]);
    }

    public function getByLogin($login) {
      return $this->setSql(
        "SELECT *
        FROM users
        WHERE login = :login
        LIMIT 1;"
      )->getRow([
        ':login' => $login
      ]);
    }

    public function getById($userId) {
      return $this->setSql(
        "SELECT userId, login
        FROM users
        WHERE userId = :userId
        LIMIT 1;"
      )->getRow([
        ':userId' => $userId
      ]);
    }

    public function updatePassword($userId, $password) {
      return $this->insertOnDuplicateKeyUpdate('users', [
        'password' => $password,
        'userId' => $userId
      ]);
    }
  }
