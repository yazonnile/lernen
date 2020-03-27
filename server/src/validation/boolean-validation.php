<?php

namespace src\validation;

class BooleanValidation extends BaseValidation {
  public function type($value) {
    return is_bool($value);
  }

  public function required() {
    return $this->value;
  }
}
