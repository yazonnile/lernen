<?php

namespace routes;

class DictRoutes {
  static public function getRoutes() {
    return [
      'dict' => [
        'url' => '/dict',
        'access' => [\api\Access::user]
      ],
      'disableWords' => [
        'url' => '/dict/disable-words',
        'methods' => ['POST'],
        'access' => [\api\Access::user]
      ],
      'enableWords' => [
        'url' => '/dict/enable-words',
        'methods' => ['POST'],
        'access' => [\api\Access::user]
      ],
      'deleteWords' => [
        'url' => '/dict/delete-words',
        'methods' => ['POST'],
        'access' => [\api\Access::user],
        'confirm' => true
      ]
    ];
  }
}