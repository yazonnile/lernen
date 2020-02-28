<?php

namespace routes;

class AddWordRoutes {
  static public function getRoutes() {
    return [
      'addWord' => [
        'url' => '/add-word',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
