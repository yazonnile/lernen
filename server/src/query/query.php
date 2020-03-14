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
      "SELECT userId, password
        FROM users
        WHERE login = :login
        LIMIT 1;"
    )->getRow([
      ':login' => $login
    ]);
  }

  public function getUserById($userId) {
    return $this->setSql(
      "SELECT userId, login,
          voice, voiceSpeed, phrases,
          soundPhrases, nouns, soundNouns,
          articles, soundArticles, plural,
          soundPlural, verbs, soundVerbs,
          strongVerbs, soundStrongVerbs, irregularVerbs,
          soundIrregularVerbs, other
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

  public function getWordsByUserId($userId) {
    return $this->setSql(
      "SELECT wordId, original, active,
          translation, type, article,
          plural, strong1, strong2, strong3,
          strong4, strong5, strong6, irregular1, irregular2
        FROM words
        WHERE userId = :userId;"
    )->getAll([
      ':userId' => $userId
    ]);
  }

  public function getCategoriesByUserId($userId) {
    return $this->setSql("SELECT categoryId, categoryName, wordId
        FROM categories

        LEFT JOIN words_to_categories
        USING (categoryId)

        WHERE userId = :userId
        ORDER BY categoryId;"
    )->getAll([':userId' => $userId]);
  }
}
