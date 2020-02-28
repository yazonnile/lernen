<?php

  namespace api;

  class Messages {
    const messages = [
      'registration.success' => [
        'persistent' => true
      ]
    ];

    /**
     * @param string $messageName
     * @return object
     */
    static public function getMessage($messageName) {
      $messageArray = explode('.', $messageName);
      $messageObject = [
        'status' => end($messageArray),
        'text' => 'messages.' . $messageName,
        'id' => time() * rand()
      ];

      if (isset(self::messages[$messageName])) {
        $messageObject = array_replace_recursive($messageObject, self::messages[$messageName]);
      }

      return $messageObject;
    }
  }
