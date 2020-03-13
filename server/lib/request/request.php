<?php

  namespace lib;

  class Request extends StateManager {
    private function getMethod() {
      return isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';
    }

    public function isPost() {
      return $this->getMethod() === 'POST';
    }

    public function isGet() {
      return $this->getMethod() === 'GET';
    }
  }
