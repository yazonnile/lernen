<?php

  namespace service;

  class Categories {
    /** @var \api\Categories */
    private $api;

    public function __construct() {
      $this->api = new \api\Categories();
    }

    public function getCategories($userId) {
      return array_reduce($this->api->getCategoriesByUserId($userId), function($carry, $row) {
        $catId = $row['categoryId'];
        if (!isset($carry[$catId])) {
          $carry[$catId] = [
            'categoryName' => $row['categoryName'],
            'categoryId' => $catId,
            'words' => []
          ];
        }

        if ($row['wordId']) {
          $carry[$catId]['words'][] = $row['wordId'];
        }
        return $carry;
      }, []);
    }

    public function createCategories($categories, $userId) {
      // validate
      $categories = array_filter($categories, function($cat) {
        $name = $cat['categoryName'] ?? null;
        return is_string($name) && mb_strlen($name) > 0 && mb_strlen($name) <= 100;
      });

      if (!count($categories)) {
        return [];
      }

      $this->api->update('categories', array_map(function($cat) use($userId) {
        return [
          'categoryName' => $cat['categoryName'],
          'userId' => $userId,
        ];
      }, $categories));

      // get new assigned
      return $this->getIdsByNames(array_map(function($cat) {
        return $cat['categoryName'];
      }, $categories), $userId);
    }

    public function getIdsByNames($categoriesNames, $userId) {
      return $this->api->getIdsByNames($categoriesNames, $userId);
    }

    public function categoriesExist($categoriesIds) {
      if (!count($categoriesIds)) {
        return [];
      }

      // get real existing categories
      return array_map(function($cat) {
        return $cat['categoryId'];
      }, $this->api->existByIds($categoriesIds));
    }

    public function getLinkedCategories($wordId) {
      return array_map(function($cat) {
        return $cat['categoryId'];
      }, $this->api->getCategoriesByWordId($wordId));
    }
  }
