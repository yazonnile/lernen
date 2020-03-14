<?php

  class Response extends StateManager {
    public function __construct() {
      $this->updateState('messages', []);
    }

    public function addErrorMessage($messageName, $errorData = null) {
      $this->updateState('error', $errorData ?? $messageName);
      if (!count($this->getState('messages'))) {
        $this->addMessage($messageName);
      }
    }

    public function addMessage($messageName) {
      $this->updateState('messages', function($messages) USE($messageName) {
        array_push($messages, Messages::getMessage($messageName));
        return $messages;
      });
    }
  }
