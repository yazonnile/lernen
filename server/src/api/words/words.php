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
        "SELECT original, active
        FROM words
        WHERE userId = :userId;"
      )->getAll([
        ':userId' => $userId
      ]);
    }
  }
