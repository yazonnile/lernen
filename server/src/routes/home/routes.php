<?php

namespace routes;

class HomeRoutes {
  static public function getRoutes() {
    return [
      'home' => [
        'url' => '/',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
