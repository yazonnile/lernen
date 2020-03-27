<?php

namespace src\validation;

class StringValidation extends BaseValidation {
  public $valueLength;

  public function __construct($value, $rule) {
    if (!isset($rule['trim']) || $rule['trim']) {
      $value = trim($value);
    }

    $this->valueLength = mb_strlen($value, 'UTF-8');
    parent::__construct($value, $rule);
  }

  public function type($value) {
    return is_string($value);
  }

  public function min() {
    return $this->valueLength >= $this->rule['min'];
  }

  public function max() {
    return $this->valueLength <= $this->rule['max'];
  }

  public function between() {
    return $this->valueLength >= $this->rule['between'][0] && $this->valueLength <= $this->rule['between'][1];
  }
}
