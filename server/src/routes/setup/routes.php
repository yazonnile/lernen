<?php

namespace routes;

class SetupRoutes {
  static public function getRoutes() {
    return [
      'setup' => [
        'url' => '/setup',
        'access' => [\api\Access::user]
      ],
      'updateSetup' => [
        'url' => '/update-setup',
        'access' => [\api\Access::user],
        'method' => 'POST',
        'payloadScheme' => ['voiceSpeed'],
      ]
    ];
  }
}
