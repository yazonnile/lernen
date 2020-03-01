<?php

  namespace service;

  class Categories {
    /** @var \api\Categories */
    private $api;

    public function __construct() {
      $this->api = new \api\Categories();
    }

    public function getCategories($userId) {
      return $this->api->getCategoriesByUserId($userId);
    }

    public function createCategories($categories, $joinedCats, $userId) {
      // validate
      $categories = array_filter($categories, function($cat) {
        $name = $cat['categoryName'] ?? null;
        return is_string($name) && mb_strlen($name) > 0 && mb_strlen($name) <= 100;
      });

      $joinedCategoriesByNames = array_map(function($cat) {
        return $cat['categoryName'];
      }, array_filter($categories, function($cat) use($joinedCats) {
        return in_array($cat['categoryId'], $joinedCats);
      }));

      if (!count($categories)) {
        return [];
      }

      $this->api->update('categories', array_map(function($cat) use($userId) {
        return [
          'categoryName' => $cat['categoryName'],
          'userId' => $userId,
        ];
      }, $categories));

      if (!count($joinedCategoriesByNames)) {
        return [];
      }

      // get new assigned
      return array_map(function($item) {
        return $item['categoryId'];
      }, $this->api->getIdsByNames($joinedCategoriesByNames, $userId));
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
