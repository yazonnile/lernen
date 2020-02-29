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

  public function getCategories($userId) {
    return $this->setSql(
      "SELECT categoryId, categoryName
        FROM categories
        WHERE userId = :userId
        ORDER BY categoryId;"
    )->getAll([
      ':userId' => $userId
    ]);
  }

  public function getIdsByNames($categoryNames, $userId) {
    $in = str_repeat('?,', count($categoryNames) - 1) . '?';
    return $this->setSql(
      "SELECT categoryId
        FROM categories
        WHERE categoryName IN ($in)
        AND userId = ?;"
    )->getAll(array_merge($categoryNames, [$userId]));
  }
}
