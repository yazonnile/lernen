<?php

class Config extends StateManager {
  public function __construct() {
    $this->updateState(null, json_decode(file_get_contents(__DIR__ . '/config.json'), true));
  }
}
