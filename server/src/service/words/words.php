<?php

  namespace service;

  class Words {
    /** @var \api\Words */
    private $api;

    /** @var \api\Setup */
    private $setupApi;

    public function __construct() {
      $this->api = new \api\Words();
      $this->setupApi = new \api\Setup();
    }

    public function getWordsByCategories($userId, $categoriesIds) {
      $setup = $this->setupApi->getSetup($userId);

      $wordsTypes = [];
      $joinTables = [];

      if ($setup['other']) {
        $wordsTypes[] = '"other"';
      }

      if ($setup['phrases']) {
        $wordsTypes[] = '"phrase"';
      }

      if ($setup['nouns']) {
        $wordsTypes[] = '"noun"';

        if ($setup['articles']) {
          $joinTables[] = 'articles';
        }

        if ($setup['plural']) {
          $joinTables[] = 'plural';
        }
      }

      if ($setup['verbs']) {
        $wordsTypes[] = '"verb"';

        if ($setup['strongVerbs']) {
          $joinTables[] = 'strong';
        }

        if ($setup['irregularVerbs']) {
          $joinTables[] = 'irregular';
        }
      }

      if (!count($wordsTypes)) {
        return [];
      }

      // build subQuery
      $subQuery = [
        'SELECT DISTINCT wordId',
        'FROM words',
        'LEFT JOIN words_to_categories USING (wordId)'
      ];

      if (!count($categoriesIds)) {
        $subQuery[] = 'WHERE categoryId IS NULL';
      } else {
        $subQuery[] = 'WHERE categoryId IN ('. implode(',', $categoriesIds) .')';
      }

      // build query
      $query = [
        'SELECT *',
        'FROM words',
      ];

      if (count($joinTables)) {
        $query = array_merge($query, array_map(function($table) {
          return "LEFT JOIN $table USING (wordId)";
        }, $joinTables));
      }

      $query[] = 'WHERE type IN ('. implode(',', $wordsTypes) .')';
      $query[] = 'AND wordId IN ('. implode(' ', $subQuery) .')';
      $query[] = 'AND active = 1';

      return $this->api->getWordsByCategoriesAndSetup(implode(' ', $query));
    }
  }
