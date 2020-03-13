<?php

  namespace lib;

  class Validation {
    private $valid;
    private $value;
    private $rules = [];

    public function __construct($name, $value) {
      $this->rules = Validation::collectRules();
      $rule = $this->rules[$name] ?? null;

      if (!$rule) {
        return;
      }

      // check optional fields just in case of existing
      if (isset($rule['optional']) && !$value) {
        $this->valid = true;
        return;
      }

      $this->validateField($value, $rule);
    }

    private function validateField($value, $rule) {
      $type = $rule['type'];
      $className = '\lib\\' . ucfirst($type) . 'Validator';
      if (class_exists($className)) {
        $instance = new $className($value, $rule);
        $this->valid = $instance->valid;

        if ($this->valid) {
          $this->value = $instance->getValue();
        }
      }
    }

    public function isValid() {
      return $this->valid;
    }

    public function getValue() {
      return $this->value;
    }

    static public function collectRules() {
      return Utils::getJSON('/lib/validation/rules.json');
    }

    static public function validateData(&$data, $scheme) {
      $errors = [];
      foreach ($scheme as $name) {
        $value = $data[$name] ?? null;
        $validation = new Validation($name, $value);

        if (!$validation->isValid()) {
          $errors[] = $name;
        } else {
          $data[$name] = $value;
        }
      }

      return $errors;
    }
  }

  class BaseValidator {
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

  class StringValidator extends BaseValidator {
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

  class NumberValidator extends BaseValidator {
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

  class BooleanValidator extends BaseValidator {
    public function type($value) {
      return is_bool($value);
    }

    public function required() {
      return $this->value;
    }
  }
