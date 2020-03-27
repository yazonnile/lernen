<?php

namespace src\db;

class PDOWrapper {
  private static $db;

  public static function init() {
    if (!self::$db) {
      try {
        $config = new \src\Config();
        $dsn = 'mysql:host='.$config->getState('db.host').';dbname='.$config->getState('db.id').';charset=utf8';
        $opt = [
          \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
          \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
        ];
        self::$db = new \PDO($dsn, $config->getState('db.id'), $config->getState('db.password'), $opt);
      } catch (\PDOException $e) {
        die('Connection error: ' . $e);
      }
    }
    return self::$db;
  }
}
