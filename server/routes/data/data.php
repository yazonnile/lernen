<?php

  namespace routes;

  use lib\Response;

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
      $text = $this->validateString($data['text'] ?? null);
      $translation = $this->validateString($data['translation'] ?? null);
      $plural = $this->validateString($data['plural'] ?? null);
      $strong1 = $this->validateString($data['strong1'] ?? null);
      $strong2 = $this->validateString($data['strong2'] ?? null);
      $strong3 = $this->validateString($data['strong3'] ?? null);
      $strong4 = $this->validateString($data['strong4'] ?? null);
      $strong5 = $this->validateString($data['strong5'] ?? null);
      $strong6 = $this->validateString($data['strong6'] ?? null);
      $irregular1 = $this->validateString($data['irregular1'] ?? null);
      $irregular2 = $this->validateString($data['irregular2'] ?? null);
      $irregular3 = $this->validateString($data['irregular3'] ?? null);
      $type = $this->validateString($data['type'] ?? null);
      $wordType = $this->validateString($data['wordType'] ?? null);
      $article = $this->validateString($data['article'] ?? null);
      $pluralOnly = !!($data['pluralOnly'] ?? null);
      $strongVerb = !!($data['strongVerb'] ?? null);
      $irregularVerb = !!($data['irregularVerb'] ?? null);

      $response = new Response();

      if (is_null($text) || is_null($type) || is_null($translation)) {
        return $response->error();
      }

      $model = [
        'text' => $text,
        'type' => $type,
        'translation' => $translation,
        'active' => true
      ];

      if (is_null($wordType)) {
        return $response->error();
      }

      if ($type === 'word') {
        $model['wordType'] = $wordType;
        if ($wordType === 'noun') {
          if (is_null($article) || (is_null($plural) && !$pluralOnly)) {
            return $response->error();
          }

          $model['article'] = $article;
          $model['plural'] = $plural;
          $model['pluralOnly'] = $pluralOnly;
        }

        if ($wordType === 'verb') {
          if ($strongVerb) {
            if (is_null($strong1) || is_null($strong2) || is_null($strong3) || is_null($strong4) || is_null($strong5) || is_null($strong6)) {
              return $response->error();
            }

            $model['strong1'] = $strong1;
            $model['strong2'] = $strong2;
            $model['strong3'] = $strong3;
            $model['strong4'] = $strong4;
            $model['strong5'] = $strong5;
            $model['strong6'] = $strong6;
          }

          if ($irregularVerb) {
            if (is_null($irregular1) || is_null($irregular2) || is_null($irregular3)) {
              return $response->error();
            }

            $model['irregular1'] = $irregular1;
            $model['irregular2'] = $irregular2;
            $model['irregular3'] = $irregular3;
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

    public function on() {
      $this->toggle(true);
    }

    public function off() {
      $this->toggle(false);
    }

    private function toggle($state) {
      $keys = json_decode($_POST['payload'], true);
      $response = new Response();

      if (is_array($keys) && count($keys)) {
        (new \api\Data())->toggleWords($keys, $state);
        echo $response->getResult();
      } else {
        return $response->error();
      }
    }
  }
