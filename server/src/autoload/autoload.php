<?php

function getClassPath($className) {
  $classPathArr = explode('\\', $className);
  $classPathArr = array_map(function($item) {
    return strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $item));
  }, $classPathArr);

  $classPathArr[] = end($classPathArr) . '.php';
  return implode('/', $classPathArr);
}

spl_autoload_register(function($className) {
  $classPath = dirname(__FILE__, 2) . '/' .  getClassPath($className);

  if (file_exists($classPath)) {
    require_once $classPath;
  }
});
