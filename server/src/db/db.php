<?php

  class Db {
    private $db;
    public $sql;

    public function __construct() {
      $this->db = PDOClass::init();
    }

    public function setSql(string $sql) : self {
      $this->sql = $sql;
      return $this;
    }

    public function getAll(array $data = null) : array {
      $sth = $this->db->prepare($this->sql);
      $sth->execute($data);
      return $sth->fetchAll();
    }

    public function getRow($data = null) {
      $sth = $this->db->prepare($this->sql);
      $sth->execute($data);
      return $sth->fetch();
    }

    public function getValue($data = null) {
      $result = $this->getRow($data);
      return is_array($result) ? (reset($result) ?: null) : null;
    }

    public function insertData(array $data = null) : bool {
      $sth = $this->db->prepare($this->sql);
      return $sth->execute($data);
    }

    public function update($table, $data) {
      if (!$data) {
        return;
      }

      return $this->insertOnDuplicateKeyUpdate($table, $data);
    }

    public function insertOnDuplicateKeyUpdate(string $table, array $data, bool $justBuildQuery = false) {
      if (is_array($data) && !count($data)) {
        return null;
      }

      $columns = '';
      $values = '';
      $update = '';
      $escapeData = [];

      if (!isset($data[0])) {
        $data = [$data];
      }

      $params = array_keys($data[0]);

      $columns .= '(';
      foreach ($params as $i => $param) {
        $columns .= $param;
        $update .= $param .'=VALUES('. $param .')';

        if ($i < count($params) - 1) {
          $columns .= ',';
          $update .= ',';
        }
      }
      $columns .= ')';

      foreach ($data as $i => $row) {
        $values .= '(';
        foreach ($params as $j => $param) {
          $id = ':'.$param.($i + 1);
          $escapeData[$id] = $row[$param] ?? null;
          $values .= $id;

          if ($j < count($params) - 1) {
            $values .= ',';
          }
        }
        $values .= ')';

        if ($i < count($data) - 1) {
          $values .= ',';
        }
      }

      $query = "INSERT INTO {$table} {$columns} VALUES {$values} ON DUPLICATE KEY UPDATE {$update}";

      return $justBuildQuery
        ? ['query' => $query, 'escapeData' => $escapeData]
        : $this->setSql($query)->insertData($escapeData);
    }

    public function getLastInsertId() : int {
      return $this->db->lastInsertId();
    }
  }

  class PDOClass {
    private static $db;

    public static function init() {
      if (!self::$db) {
        try {
          $config = new Config();
          $dsn = 'mysql:host='.$config->getState('db.host').';dbname='.$config->getState('db.id').';charset=utf8';
          $opt = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
          ];
          self::$db = new PDO($dsn, $config->getState('db.id'), $config->getState('db.password'), $opt);
        } catch (PDOException $e) {
          die('Connection error: ' . $e);
        }
      }
      return self::$db;
    }
  }
