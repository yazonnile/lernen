<?php

  namespace lib;

  function autoload() {
    spl_autoload_register(function($className) {
      $classPathArr = explode('\\', $className);
      $classPathArr = array_map(function($item) {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $item));
      }, $classPathArr);

      if ($classPathArr[0] === 'routes' && preg_match('/\-routes$/', $classPathArr[1])) {
        // special rules for routes.php files
        $classPathArr[1] = preg_replace('/\-routes$/', '', $classPathArr[1]);
        $classPathArr[] = 'routes.php';
      } else {
        // general classes
        $classPathArr[] = end($classPathArr) . '.php';
      }

      $classPath = HOME . '/' . implode('/', $classPathArr);

      if (file_exists($classPath)) {
        require_once $classPath;
      }
    });
  }
