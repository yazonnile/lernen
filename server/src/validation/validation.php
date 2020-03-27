<?php

namespace src;

class Validation {
  private $valid;
  private $value;
  private $rules;

  public function __construct($name, $value) {
    $this->rules = self::collectRules();
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
    return [
      'login' => ['type' => 'string', 'between' => [2, 25]],
      'password' => ['type' => 'string', 'max' => 25, 'trim' => false],
      'mcnulty' => ['type' => 'string', 'equal' => '5'],
      'type' => ['type' => 'string', 'match' => '^(noun|verb|other|phrase)$'],
      'original' => ['type' => 'string', 'max' => 100],
      'translation' => ['type' => 'string', 'max' => 100],
      'plural' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'article' => ['type' => 'string', 'match' => '^(der|die|das)$', 'optional' => true],
      'strong1' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'strong2' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'strong3' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'strong4' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'strong5' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'strong6' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'irregular1' => ['type' => 'string', 'max' => 100, 'optional' => true],
      'irregular2' => ['type' => 'string', 'max' => 100, 'optional' => true],
    ];
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
