<?php

namespace routes;

class StatRoutes {
  static public function getRoutes() {
    return [
      'stat' => [
        'url' => '/stat',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
