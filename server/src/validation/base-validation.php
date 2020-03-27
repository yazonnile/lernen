<?php

namespace src\validation;

class BaseValidation {
  public $value;
  public $rule;
  public $valid = true;

  public function __construct($value, $rule) {
    $this->value = $value;
    $this->rule = $rule;

    if (!$this->type($value)) {
      $this->valid = false;
      return;
    }

    foreach ($rule as $ruleName => $ruleValue) {
      if (in_array($ruleName, ['type', 'value', 'trim', 'optional'])) {
        continue;
      }

      if (!method_exists($this, $ruleName) || !$this->$ruleName()) {
        $this->valid = false;
        break;
      }
    }
  }

  public function equal() {
    return $this->value === $this->rule['equal'];
  }

  public function match() {
    return preg_match('/'.$this->rule['match'].'/', strval($this->value));
  }

  public function required() {
    if (!$this->value) {
      return false;
    }

    return !!strval($this->value);
  }

  public function getValue() {
    return $this->value;
  }
}
