<?php

  namespace routes;

  class Data {
    public function __construct() {

    }

    private function validateString($str) {
      if (is_string($str) && strlen($str) <= 150 && strlen($str) >= 1) {
        return $str;
      } else {
        return null;
      }
    }

    public function add() {
      $data = json_decode($_POST['payload'], true);
      $text = $this->validateString($data['text']);
      $translation = $this->validateString($data['translation']);
      $plural = $this->validateString($data['plural']);
      $strong1 = $this->validateString($data['strong1']);
      $strong2 = $this->validateString($data['strong2']);
      $strong3 = $this->validateString($data['strong3']);
      $strong4 = $this->validateString($data['strong4']);
      $strong5 = $this->validateString($data['strong5']);
      $strong6 = $this->validateString($data['strong6']);
      $type = $this->validateString($data['type']);
      $wordType = $this->validateString($data['wordType']);
      $article = $this->validateString($data['article']);
      $strongVerb = $data['strongVerb'] ?? null;

      $response = new \lib\Response();

      if (is_null($text) || is_null($type) || is_null($translation)) {
        return $response->error();
      }

      $model = [
        'text' => $text,
        'type' => $type,
        'translation' => $translation
      ];

      if (is_null($wordType)) {
        return $response->error();
      }

      $model['wordType'] = $wordType;

      if ($type === 'word') {
        if ($wordType === 'noun') {
          if (is_null($article) || is_null($plural)) {
            return $response->error();
          }

          $model['article'] = $article;
          $model['plural'] = $plural;
        }

        if ($wordType === 'verb') {
          if ($strongVerb) {
            if ((is_null($strong1) || is_null($strong2) || is_null($strong3) || is_null($strong4) || is_null($strong5) || is_null($strong6))) {
              return $response->error();
            }

            $model['strong1'] = $strong1;
            $model['strong2'] = $strong2;
            $model['strong3'] = $strong3;
            $model['strong4'] = $strong4;
            $model['strong5'] = $strong5;
            $model['strong6'] = $strong6;
          }
        }
      }

      (new \api\Data())->addData($model);
      $response->data([
        'key' => $text,
        'data' => $model
      ]);
      echo $response->getResult();
    }

    public function remove() {

    }
  }
