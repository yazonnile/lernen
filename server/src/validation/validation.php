<?php

namespace src;

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
    $className = 'src\validation\\' . ucfirst($type) . 'Validation';
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
    return json_decode(file_get_contents(__DIR__ . '/rules.json'), true);
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
