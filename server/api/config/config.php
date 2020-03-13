<?php

  namespace api;

  class Config extends \lib\StateManager {
    public function __construct() {
      $this->updateState(null, \lib\Utils::getJSON('/api/config/config.json'));
    }
  }
