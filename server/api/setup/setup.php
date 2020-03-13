<?php

  namespace api;

  class Setup extends \lib\Db {
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
