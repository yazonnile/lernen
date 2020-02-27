<?php

  namespace api;

  use lib\Utils;

  class Data {
    private $data = [];
    private $userId;

    public function __construct() {
      $this->userId = Utils::getUserId();

      if ($this->userId) {
        $this->data = $this->getDataByUser($this->userId);
      }
    }

    public function getData() {
      return $this->data;
    }

    public function getDataByUser($userId) {
      return Utils::getJSON('/api/data/' . $userId . '.json');
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
