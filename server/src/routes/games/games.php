<?php

  namespace routes;

  class Games extends \lib\RouteComponent {
    /** @var \service\Words */
    private $categoriesService;

    /** @var \service\Words */
    private $wordsService;

    /** @var \api\Setup */
    private $apiSetup;

    public function __construct() {
      $this->wordsService = new \service\Words();
      $this->categoriesService = new \service\Categories();
      $this->apiSetup = new \api\Setup();
    }

    public function preGame() {
      $this->updateState('categories', $this->categoriesService->getCategories($this->user->getId()));
    }

    public function learn() {
      $userId = $this->user->getId();
      $words = $this->wordsService->getWordsByCategories(
        $userId,
        $this->getPayload('selectedCategories') ?? [],
        boolval($this->getPayload('nullCategory'))
      );

      shuffle($words);

      $this->updateState('learn', $words);
      $this->updateState('setup', $this->apiSetup->getSetup($userId));
    }
  }
