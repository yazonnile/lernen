<?php

  namespace api;

  class Words extends \lib\Db {
    public function removeByWordId($table, $wordId) {
      return $this->setSql(
        "DELETE FROM $table
        WHERE wordId = :wordId;"
      )->insertData([
        ':wordId' => $wordId
      ]);
    }

    public function getWords($userId) {
      return $this->setSql(
        "SELECT original, active, wordId
        FROM words
        WHERE userId = :userId;"
      )->getAll([
        ':userId' => $userId
      ]);
    }

    public function getWord($wordId, $userId) {
      return $this->setSql(
        "SELECT *
        FROM words

        LEFT JOIN articles
        USING (wordId)

        LEFT JOIN plural
        USING (wordId)

        LEFT JOIN irregular
        USING (wordId)

        LEFT JOIN strong
        USING (wordId)

        WHERE wordId = :wordId
        AND userId = :userId
        LIMIT 1;"
      )->getRow([
        ':wordId' => $wordId,
        ':userId' => $userId
      ]);
    }

    public function getWordsByCategoriesAndSetup($query) {
      return $this->setSql($query)->getAll();
    }

    public function updateWords($ids, $active, $userId) {
      $in = str_repeat('?,', count($ids) - 1) . '?';
      return $this->setSql(
        "UPDATE words
        SET active = ?
        WHERE userId = ?
        AND wordId IN ($in);"
      )->insertData(array_merge([intval(boolval($active)), $userId], $ids));
    }

    public function deleteWords($ids, $userId) {
      $in = str_repeat('?,', count($ids) - 1) . '?';
      $data = array_merge([$userId], $ids);

      return $this->setSql(
        "DELETE words, articles, irregular, plural, strong, words_to_categories
        FROM words

        LEFT JOIN articles USING (wordId)
        LEFT JOIN irregular USING (wordId)
        LEFT JOIN plural USING (wordId)
        LEFT JOIN strong USING (wordId)
        LEFT JOIN words_to_categories USING (wordId)

        WHERE userId = ?
        AND words.wordId IN($in);"
      )->insertData($data);
    }
  }
