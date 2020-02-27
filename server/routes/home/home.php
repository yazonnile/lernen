<?php

  namespace routes;

  use lib\Utils;

  class Home {
    public function __construct() {
      $indexPage = Utils::getFile('/routes/home/index.html');
      $userId = Utils::getUserId();

      $data = $userId ? (new \api\Data())->getData($userId) : [];
      $indexPage = preg_replace('/{{% DATA %}}/', json_encode($data, JSON_NUMERIC_CHECK), $indexPage);
      echo $indexPage;
    }
  }
