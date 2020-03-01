<?php

namespace routes;

class CategoriesRoutes {
  static public function getRoutes() {
    return [
      'categories' => [
        'url' => '/categories',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
