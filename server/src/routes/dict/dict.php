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

    private function getIds() {
      return array_map(function($wordId) {
        return intval($wordId);
      }, $this->getPayload('wordsIds') ?? []);
    }

    public function disableWords() {
      $ids = $this->toggleWords(false);
      $this->updateState('disabledIds', $ids);
      $this->addMessage('disableWords.success');
    }

    public function enableWords() {
      $ids = $this->toggleWords(true);
      $this->updateState('enabledIds', $ids);
      $this->addMessage('enableWords.success');
    }

    private function toggleWords($state) {
      $ids = $this->getIds();

      if (count($ids)) {
        $this->api->updateWords($ids, $state, $this->user->getId());
      }

      return $ids;
    }

    public function deleteWords() {
      $ids = $this->getIds();

      if (count($ids)) {
        $this->api->deleteWords($ids, $this->user->getId());
      }

      $this->addMessage('deleteWords.success');
    }
  }
