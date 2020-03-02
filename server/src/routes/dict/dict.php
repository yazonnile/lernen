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

    private function getIds() {
      return array_map(function($wordId) {
        return intval($wordId);
      }, $this->getPayload('wordsIds') ?? []);
    }

    public function disableWords() {
      $this->toggleWords(false);
      $this->addMessage('disableWords.success');
    }

    public function enableWords() {
      $this->toggleWords(true);
      $this->addMessage('enableWords.success');
    }

    private function toggleWords($state) {
      $ids = $this->getIds();

      if (count($ids)) {
        $this->api->updateWords($ids, $state, $this->user->getId());
      }

      $this->dict();
    }

    public function deleteWords() {
      $ids = $this->getIds();

      if (count($ids)) {
        $this->api->deleteWords($ids, $this->user->getId());
      }

      $this->addMessage('deleteWords.success');
      $this->dict();
    }
  }
