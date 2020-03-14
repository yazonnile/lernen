<?php

  function autoload() {
    spl_autoload_register(function($className) {
      $classPathArr = explode('\\', $className);
      $classPathArr = array_map(function($item) {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $item));
      }, $classPathArr);

      $classPathArr[] = end($classPathArr) . '.php';
      $classPath = HOME . '/' . implode('/', $classPathArr);

      if (file_exists($classPath)) {
        require_once $classPath;
      }
    });
  }
