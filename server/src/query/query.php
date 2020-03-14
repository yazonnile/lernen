<?php

class Query extends Db {
  public function registerUser($login, $password) {
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

  public function isLoginAlreadyExists($login) {
    return $this->setSql(
      "SELECT login
        FROM users
        WHERE login = :login
        LIMIT 1;"
    )->getRow([
      ':login' => $login
    ]);
  }

  public function isUserExistsById($userId) {
    return $this->setSql(
      "SELECT userId
        FROM users
        WHERE userId = :userId
        LIMIT 1;"
    )->getValue([
      ':userId' => $userId
    ]);
  }

  public function getUserByLogin($login) {
    return $this->setSql(
      "SELECT *
        FROM users
        WHERE login = :login
        LIMIT 1;"
    )->getRow([
      ':login' => $login
    ]);
  }

  public function getUserById($userId) {
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
