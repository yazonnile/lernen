<?php

namespace routes;

class AuthRoutes {
  static public function getRoutes() {
    return [
      'registerUser' => [
        'method' => 'POST',
        'payloadScheme' => ['login', 'password', 'email', 'mcnulty'],
        'access' => [\api\Access::guest]
      ],

      'logout' => [
        'method' => 'POST',
        'access' => [\api\Access::user]
      ],

      'login' => [
        'method' => 'POST',
        'payloadScheme' => ['loginOrEmail', 'password'],
        'access' => [\api\Access::guest]
      ],

      'auth' => [
        'access' => [\api\Access::guest]
      ],

      'askForPasswordRecovery' => [
        'method' => 'POST',
        'payloadScheme' => ['loginOrEmail'],
        'access' => [\api\Access::guest]
      ]
    ];
  }
}
