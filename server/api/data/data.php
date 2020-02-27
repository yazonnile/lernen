<?php

  namespace api;

  use lib\Utils;

  class Data {
    private $data = [];
    private $userId;

    public function __construct() {
      $this->userId = Utils::getUserId(true);
      $this->data = \lib\Utils::getJSON('/api/data/' . $this->userId . '.json');
    }

    public function getData() {
      return $this->data;
    }

    public function removeData($keys) {

    }

    public function addData($model) {
      $text = $model['text'];
      $this->data = array_merge_recursive($this->data, [
        'data' => [$text => $model]
      ]);

      Utils::createFile('/api/data/' . $this->userId . '.json', json_encode($this->data, JSON_UNESCAPED_UNICODE));
    }
  }
