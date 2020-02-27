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

    public function setData() {
      Utils::createFile('/api/data/' . $this->userId . '.json', json_encode($this->data, JSON_UNESCAPED_UNICODE));
    }

    public function addData($model) {
      $text = $model['text'];
      $this->data['data'] = array_merge($this->data['data'], [$text => $model]);
      $this->setData();
    }

    public function updateSetup($model) {
      $this->data['setup'] = $model;
      $this->setData();
    }

    public function toggleWords($keys, $state) {
      foreach ($keys as $key) {
        $word = &$this->data['data'][$key] ?? null;
        if (!is_null($word)) {
          $word['active'] = $state;
        }
      }

      $this->setData();
    }
  }
