<?php

  namespace lib;

  class InitialState extends RouteComponent {
    public function init($userId) {
      /** @var \service\Words */
      $categoriesService = new \service\Categories();

      /** @var \api\Setup() */
      $setupApi = new \api\Setup();

      /** @var \api\Words */
      $wordsApi = new \api\Words();

      return [
        'games' => [
          'learn' => [
            'buttonText' => 'учить',
            'categories' => []
          ]
        ],
        'categories' => $categoriesService->getCategories($userId),
        'setup' => $setupApi->getSetup($userId),
        'words' =>array_reduce($wordsApi->getWords($userId), function($carry, $word) {
          $carry[$word['wordId']] = $word;
          return $carry;
        }, [])
      ];
    }
  }
