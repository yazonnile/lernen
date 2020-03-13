<?php

namespace routes;

class WordsRoutes {
  static public function getRoutes() {
    return [
      'addWord' => [
        'url' => '/words/add',
        'access' => [\api\Access::user]
      ],
      'editWord' => [
        'url' => '/words/edit/[i:wordId]',
        'access' => [\api\Access::user]
      ],
      'saveNoun' => [
        'url' => '/save-noun',
        'access' => [\api\Access::user],
        'method' => 'POST',
        'payloadScheme' => ['original', 'plural', 'article', 'translation'],
      ],
      'saveOther' => [
        'url' => '/save-other',
        'access' => [\api\Access::user],
        'method' => 'POST',
        'payloadScheme' => ['type', 'original', 'translation'],
      ],
      'saveVerb' => [
        'url' => '/save-verb',
        'access' => [\api\Access::user],
        'method' => 'POST',
        'payloadScheme' => ['original', 'translation', 'strong1', 'strong2', 'strong3', 'strong4', 'strong5', 'strong6', 'irregular1', 'irregular2'],
      ]
    ];
  }
}
