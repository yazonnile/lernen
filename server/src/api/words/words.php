<?php

  namespace api;

  class Words extends \lib\Db {
    public function update($table, $data) {
      return $this->insertOnDuplicateKeyUpdate($table, $data);
    }

    public function removeByWordId($table, $wordId) {
      return $this->setSql(
        "DELETE FROM $table
        WHERE wordId = :wordId;"
      )->insertData([
        ':wordId' => $wordId
      ]);
    }
  }
