<?php

namespace routes;

class AddWordRoutes {
  static public function getRoutes() {
    return [
      'addWord' => [
        'url' => '/add-word',
        'access' => [\api\Access::user]
      ],
      'saveNoun' => [
        'url' => '/save-noun',
        'access' => [\api\Access::user],
        'methods' => ['POST'],
        'payloadScheme' => ['original', 'plural', 'article', 'translation'],
      ],
      'saveOther' => [
        'url' => '/save-other',
        'access' => [\api\Access::user],
        'methods' => ['POST'],
        'payloadScheme' => ['type', 'original', 'translation'],
      ],
      'saveVerb' => [
        'url' => '/save-verb',
        'access' => [\api\Access::user],
        'methods' => ['POST'],
        'payloadScheme' => ['original', 'translation', 'strongVerb', 'irregularVerb', 'strong1', 'strong2', 'strong3', 'strong4', 'strong5', 'strong6', 'irregular1', 'irregular2', 'irregular3'],
      ]
    ];
  }
}
