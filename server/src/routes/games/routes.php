<?php

namespace routes;

class GamesRoutes {
  static public function getRoutes() {
    return [
      'preGame' => [
        'url' => '/games/pre-game',
        'access' => [\api\Access::user],
        'payloadScheme' => ['gameId'],
      ],
      'learn' => [
        'url' => '/games/learn',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
