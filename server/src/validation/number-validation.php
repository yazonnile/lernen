<?php

namespace src\validation;

class NumberValidation extends BaseValidation {
  public function __construct($value, $rule) {
    $value = trim($value);
    $value = filter_var($value, FILTER_VALIDATE_INT);

    parent::__construct($value, $rule);
  }

  public function type($value) {
    return is_int($value);
  }

  public function min() {
    return $this->value >= $this->rule['min'];
  }

  public function max() {
    return $this->value <= $this->rule['max'];
  }

  public function between() {
    return $this->value >= $this->rule['between'][0] && $this->value <= $this->rule['between'][1];
  }

  public function required() {
    return is_int($this->value) ? $this->value : (floatval($this->value) > 0);
  }
}
