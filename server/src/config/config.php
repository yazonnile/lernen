<?php

class Config extends StateManager {
  public function __construct() {
    $this->updateState(null, Utils::getJSON('/config/config.json'));
  }
}
