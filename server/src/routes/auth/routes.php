<?php

namespace routes;

class AuthRoutes {
  static public function getRoutes() {
    return [
      'registerUser' => [
        'methods' => ['POST'],
        'payloadScheme' => ['login', 'password', 'email', 'mcnulty'],
        'access' => [\api\Access::guest]
      ],

      'auth' => [
        'methods' => ['GET'],
        'access' => [\api\Access::guest]
      ],

      'askForPasswordRecovery' => [
        'methods' => ['POST'],
        'payloadScheme' => ['loginOrEmail'],
        'access' => [\api\Access::guest]
      ]
    ];
  }
}
