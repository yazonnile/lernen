<?php

namespace routes;

class GamesRoutes {
  static public function getRoutes() {
    return [
      'preGame' => [
        'url' => '/games/pre-game/[a:gameName]',
        'access' => [\api\Access::user]
      ],
      'learn' => [
        'url' => '/games/learn',
        'access' => [\api\Access::user]
      ]
    ];
  }
}
