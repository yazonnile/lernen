<?php

  namespace routes;

  class Auth {
    public function __construct() {
      $data = json_decode($_POST['payload'], true);
      $login = $data['login'] ?? null;
      $password = $data['password'] ?? null;
      $response = new \lib\Response();

      if (!is_string($login) || !strlen($login) || !is_string($password) || !strlen($password)) {
        return $response->error();
      }

      $user = (new \api\Users())->getUser($login, $password);

      if (!$user) {
        return $response->error();
      }

      setcookie(
        'deu', base64_encode($login),
        time() + 60 * 60 * 24 * 100, '/', null, null, true
      );

      $response->data(
        (new \api\Data())->getDataByUser($login)
      );
      echo $response->getResult();
    }
  }
