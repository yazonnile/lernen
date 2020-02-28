<?php

namespace routes;

class DictRoutes {
  static public function getRoutes() {
    return [
      'dict' => [
        'url' => '/dict',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
