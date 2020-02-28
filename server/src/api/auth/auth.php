<?php

  namespace api;

  class Auth extends \lib\Db {
    public function register($login, $email, $password) {
      $this->setSql(
        "INSERT INTO users

        SET
          login = :login,
          email = :email,
          password = :password,
          regDate = :regDate,
          lastVisitDate = :regDate;"
      )->insertData([
        ':login' => $login,
        ':email' => $email,
        ':password' => $password,
        ':regDate' => time()
      ]);

      return $this->getLastInsertId();
    }

    public function existByCredentials($login, $email) {
      return $this->setSql(
        "SELECT userId, email, login
        FROM users
        WHERE login = :login OR email = :email
        LIMIT 1;"
      )->getRow([
        ':login' => $login,
        ':email' => $email
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

    public function getByLoginOrEmail($loginOrEmail) {
      return $this->setSql(
        "SELECT *
        FROM users
        WHERE login = :login OR email = :email
        LIMIT 1;"
      )->getRow([
        ':login' => $loginOrEmail,
        ':email' => $loginOrEmail
      ]);
    }

    public function getById($userId) {
      return $this->setSql(
        "SELECT userId, login, regDate, lastVisitDate
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

    public function updateLastVisitDate($userId, $lastVisitDate) {
      return $this->insertOnDuplicateKeyUpdate('users', [
        'lastVisitDate' => $lastVisitDate,
        'userId' => $userId
      ]);
    }
  }
