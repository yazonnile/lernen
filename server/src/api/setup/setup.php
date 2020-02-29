<?php

  namespace api;

  class Setup extends \lib\Db {
    public function update($setup) {
      return $this->insertOnDuplicateKeyUpdate('setup', $setup);
    }

    public function getSetup($userId) {
      return $this->setSql(
        "SELECT *
        FROM setup
        WHERE userId = :userId
        LIMIT 1;"
      )->getRow([
        ':userId' => $userId
      ]);
    }
  }
