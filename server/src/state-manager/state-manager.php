<?php

class StateManager {
  private $data = [];

  public function clear() {
    $this->data = [];
  }

  public function getState($keys = null) {
    if (!is_string($keys)) {
      return $this->data;
    }

    $object = $this->getObject($keys);
    return $object ? $object['value'] : null;
  }

  public function removeKey($keys) {
    $object = $this->getObject($keys);

    if ($object) {
      unset($object['parent'][$object['key']]);
    }
  }

  public function updateState($keys, $f) {
    if (!is_string($keys)) {
      $this->data = $this->getUpdateValue($f, $this->data);
      return;
    }

    $object = $this->getObject($keys, true);

    if ($object) {
      $object['parent'][$object['key']] = $this->getUpdateValue($f, $object['value']);
    }
  }

  private function getUpdateValue($f, $data) {
    return is_callable($f) ? $f($data) : $f;
  }

  private function getObject($keys, $ensure = false) {
    $keys = explode('.', $keys);

    if (!count($keys)) {
      return null;
    }

    $key = array_pop($keys);
    $value = &$this->data;

    foreach ($keys as $i => $dataKey) {
      if (!isset($value[$dataKey])) {
        if (!$ensure) {
          return null;
        }

        $value[$dataKey] = [];
      }

      $value = &$value[$dataKey];
    }

    return [
      'key' => $key,
      'parent' => &$value,
      'value' => $value[$key] ?? ($ensure ? [] : null)
    ];
  }
}
