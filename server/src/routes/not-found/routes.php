<?php

namespace routes;

class NotFoundRoutes {
  static public function getRoutes() {
    return [
      'notFound' => [
        'url' => '*'
      ]
    ];
  }
}
