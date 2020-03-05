<?php

namespace api;

class Categories extends \lib\Db {
  public function existByIds($catsIds) {
    $in = str_repeat('?,', count($catsIds) - 1) . '?';
    return $this->setSql(
      "SELECT categoryId
        FROM categories
        WHERE categoryId IN ($in);"
    )->getAll($catsIds);
  }

  public function getCategoriesByUserId($userId) {
    return $this->setSql(
      "SELECT categoryId, categoryName, wordId
        FROM categories

        LEFT JOIN words_to_categories
        USING (categoryId)

        WHERE userId = :userId
        ORDER BY categoryId;"
    )->getAll([
      ':userId' => $userId
    ]);
  }

  public function getCategoriesByWordId($wordId) {
    return $this->setSql(
      "SELECT categoryId
        FROM words_to_categories

        LEFT JOIN categories
        USING (categoryId)

        WHERE wordId = :wordId
        ORDER BY categoryId;"
    )->getAll([
      ':wordId' => $wordId
    ]);
  }

  public function getIdsByNames($categoryNames, $userId) {
    $in = str_repeat('?,', count($categoryNames) - 1) . '?';
    return $this->setSql(
      "SELECT categoryId, categoryName
        FROM categories
        WHERE categoryName IN ($in)
        AND userId = ?;"
    )->getAll(array_merge($categoryNames, [$userId]));
  }
}
