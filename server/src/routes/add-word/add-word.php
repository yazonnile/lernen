<?php

  namespace routes;

  use api\Types;

  class AddWord extends \lib\RouteComponent {
    /** @var \api\Words */
    private $api;

    /** @var \service\Categories */
    private $categoriesService;

    public function __construct() {
      $this->api = new \api\Words();
      $this->categoriesService = new \service\Categories();
    }

    public function addWord() {
      $this->updateState('categories', $this->categoriesService->getCategories($this->user->getId()));
    }

    public function saveNoun() {
      $wordId = $this->saveWord(Types::noun);

      // article
      $this->api->update('articles', [
        'wordId' => $wordId,
        'article' => $this->getPayload('article')
      ]);

      // plural
      $this->api->removeByWordId('plural', $wordId);
      $plural = $this->getPayload('plural');
      if ($plural) {
        $this->api->update('plural', [
          'wordId' => $wordId,
          'plural' => $plural
        ]);
      }

      $this->addWord();
      $this->addMessage('saveNoun.success');
    }

    public function saveVerb() {
      $wordId = $this->saveWord(Types::verb);

      // strong
      $this->api->removeByWordId('strong', $wordId);
      $strong = $this->getPayload('strongVerb');
      if ($strong) {
        $this->api->update('strong', [
          'wordId' => $wordId,
          'strong1' => $this->getPayload('strong1'),
          'strong2' => $this->getPayload('strong2'),
          'strong3' => $this->getPayload('strong3'),
          'strong4' => $this->getPayload('strong4'),
          'strong5' => $this->getPayload('strong5'),
          'strong6' => $this->getPayload('strong6'),
        ]);
      }

      // irregular
      $this->api->removeByWordId('irregular', $wordId);
      $irregular = $this->getPayload('irregularVerb');
      if ($irregular) {
        $this->api->update('irregular', [
          'wordId' => $wordId,
          'irregular1' => $this->getPayload('irregular1'),
          'irregular2' => $this->getPayload('irregular2'),
          'irregular3' => $this->getPayload('irregular3'),
        ]);
      }

      $this->addWord();
      $this->addMessage('saveVerb.success');
    }

    public function saveOther() {
      $type = $this->getPayload('type');
      $this->saveWord($type);
      $this->addWord();
      $this->addMessage('saveOther.success');
    }

    private function saveWord($type) {
      $wordId = $this->getPayload('wordId') ?? 1;
      $word = [
        'type' => $type,
        'original' => $this->getPayload('original'),
        'translation' => $this->getPayload('translation'),
        'active' => true,
        'userId' => $this->user->getId()
      ];

      if ($wordId) {
        $word['wordId'] = $wordId;
      }

      $this->api->update('words', $word);

      if ($wordId) {
        $this->api->removeByWordId('words_to_categories', $wordId);
      } else {
        $wordId = $this->api->getLastInsertId();
      }

      if ($this->getPayload('categoriesActive')) {
        $linkedCategories = $this->getPayload('linkedCategories');
        $createdAndLinked = $this->categoriesService->createCategories(
          array_map(function($cat) {
            return [ 'categoryName' => mb_strtolower($cat['categoryName']), 'categoryId' => $cat['categoryId'] ];
          }, $this->getPayload('createdCategories')),
          $linkedCategories,
          $this->user->getId()
        );

        $linkedCategories = $this->categoriesService->categoriesExist($this->getPayload('linkedCategories'));
        $rows = array_map(function($catId) use($wordId) {
          return [
            'wordId' => $wordId,
            'categoryId' => $catId
          ];
        }, array_values(array_unique(array_merge($linkedCategories, $createdAndLinked))));

        if (count($rows)) {
          // join cats with word
          $this->api->update('words_to_categories', $rows);
        }
      }

      return $wordId;
    }
  }
