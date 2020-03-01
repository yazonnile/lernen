<?php

  namespace routes;

  class Dict extends \lib\RouteComponent {
    /** @var \api\Words */
    private $api;

    /** @var \service\Categories */
    private $categoriesService;

    public function __construct() {
      $this->api = new \api\Words();
      $this->categoriesService = new \service\Categories();
    }

    public function dict() {
      $this->updateState(
        'words',
        array_reduce($this->api->getWords($this->user->getId()), function($carry, $word) {
          $carry[$word['original']] = $word;
          return $carry;
        }, [])
      );
    }
  }
