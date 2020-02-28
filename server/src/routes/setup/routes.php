<?php

namespace routes;

class SetupRoutes {
  static public function getRoutes() {
    return [
      'setup' => [
        'url' => '/setup',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
