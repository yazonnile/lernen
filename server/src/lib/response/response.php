<?php

  namespace lib;

  class Response extends StateManager {
    public function __construct() {
      $this->updateState('persistentData.messages', []);
      $this->updateState('privateData', []);
      $this->updateState('pageData', []);
    }

    public function setError($messageName, $errorData = null) {
      $this->updateState('error', $errorData ?? $messageName);
      if (!count($this->getState('persistentData.messages'))) {
        $this->addMessage($messageName);
      }
    }

    public function addMessage($messageName) {
      $this->updateState('persistentData.messages', function($messages) USE($messageName) {
        array_push($messages, \api\Messages::getMessage($messageName));
        return $messages;
      });
    }
  }
