<?php

namespace routes;

class AuthRoutes {
  static public function getRoutes() {
    return [
      'registerUser' => [
        'method' => 'POST',
        'payloadScheme' => ['login', 'password', 'mcnulty'],
        'access' => [\api\Access::guest]
      ],

      'logout' => [
        'method' => 'POST',
        'access' => [\api\Access::user]
      ],

      'login' => [
        'method' => 'POST',
        'payloadScheme' => ['login', 'password'],
        'access' => [\api\Access::guest]
      ],

      'auth' => [
        'access' => [\api\Access::guest]
      ],
    ];
  }
}
