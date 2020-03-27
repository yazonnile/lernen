<?php

namespace src;

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
          strong4, strong5, strong6, irregular1, irregular2,
          wordCats.categories

        FROM words

        LEFT JOIN (
          SELECT
            wordId,
            GROUP_CONCAT(categoryId ORDER BY categoryId ASC SEPARATOR ', ') categories
          FROM words_to_categories
          GROUP BY wordId
        ) as wordCats
        USING (wordId)

        WHERE userId = :userId;"
    )->getAll([
      ':userId' => $userId
    ]);
  }

  public function getCategoriesByUserId($userId) {
    return $this->setSql(
      "SELECT categoryId, categoryName
        FROM categories
        WHERE userId = :userId;"
    )->getAll([':userId' => $userId]);
  }

  public function categoriesExistByIds($categoriesIds, $userId) {
    $in = str_repeat('?,', count($categoriesIds) - 1) . '?';
    return $this->setSql(
      "SELECT categoryId
        FROM categories
        WHERE userId = ?
        AND categoryId IN ($in);"
    )->getAll(array_merge([$userId], $categoriesIds));
  }

  public function getCategoriesByNames($categoriesNames, $userId) {
    $in = str_repeat('?,', count($categoriesNames) - 1) . '?';
    return $this->setSql(
      "SELECT categoryId, categoryName
        FROM categories
        WHERE userId = ?
        AND categoryName IN ($in);"
    )->getAll(array_merge([$userId], $categoriesNames));
  }

  public function deleteCategories($ids, $userId) {
    $in = str_repeat('?,', count($ids) - 1) . '?';
    return $this->setSql(
      "DELETE categories, words_to_categories
        FROM categories

        LEFT JOIN words_to_categories USING (categoryId)

        WHERE userId = ?
        AND categories.categoryId IN($in);"
    )->insertData(array_merge([$userId], $ids));
  }

  public function deleteWords($ids, $userId) {
    $in = str_repeat('?,', count($ids) - 1) . '?';
    return $this->setSql(
      "DELETE words, words_to_categories
        FROM words

        LEFT JOIN words_to_categories USING (wordId)

        WHERE userId = ?
        AND words.wordId IN($in);"
    )->insertData(array_merge([$userId], $ids));
  }

  public function deleteWordToCategoriesByWordName($wordsNames, $userId) {
    $in = str_repeat('?,', count($wordsNames) - 1) . '?';
    return $this->setSql(
      "DELETE words_to_categories
        FROM words_to_categories
        LEFT JOIN words USING (wordId)

        WHERE userId = ?
        AND original IN($in);"
    )->insertData(array_merge([$userId], $wordsNames));
  }

  public function getWordsByNames($wordsNames, $userId) {
    $in = str_repeat('?,', count($wordsNames) - 1) . '?';
    return $this->setSql(
      "SELECT wordId, original
        FROM words
        WHERE userId = ?
        AND original IN ($in);"
    )->getAll(array_merge([$userId], $wordsNames));
  }
}
