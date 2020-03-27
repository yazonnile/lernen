<?php

namespace src;

class Jwt {
  /** @var \Lcobucci\JWT\Builder */
  private $token;
  private $dataKey = 'jwtData';

  public function __construct($tokenString = null) {
    $this->token = is_string($tokenString)
      ? (new \Lcobucci\JWT\Parser())->parse($tokenString)
      : new \Lcobucci\JWT\Builder();
  }

  public function generateTokenFromData($data, $salt) {
    return (string)(
      $this->token
        ->withClaim($this->dataKey, $data)
        ->getToken(new \Lcobucci\JWT\Signer\Hmac\Sha256(), new \Lcobucci\JWT\Signer\Key($salt))
    );
  }

  public function getData() {
    return (array)$this->token->getClaim($this->dataKey);
  }

  public function verifyToken($salt) {
    return $this->token->verify(new \Lcobucci\JWT\Signer\Hmac\Sha256(), $salt);
  }
}
