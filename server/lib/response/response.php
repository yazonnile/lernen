<?php

  namespace lib;

  class Response {
    private $data = [];

    public function error() {
      $this->data['error'] = true;
      echo $this->getResult();
      return false;
    }

    public function data($data) {
      $this->data['data'] = $data;
    }

    public function getResult() {
      return json_encode($this->data, JSON_NUMERIC_CHECK);
    }
  }
