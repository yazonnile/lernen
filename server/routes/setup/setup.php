<?php

  namespace routes;

  class Setup {
    public function save() {
      $setup = json_decode($_POST['payload'], true);
      $response = new \lib\Response();

      $model = [
        'phrases' => boolval($setup['phrases'] ?? null),
        'soundPhrases' => boolval($setup['soundPhrases'] ?? null),
        'words' => boolval($setup['words'] ?? null),
        'soundWords' => boolval($setup['soundWords'] ?? null),
        'nouns' => boolval($setup['nouns'] ?? null),
        'articles' => boolval($setup['articles'] ?? null),
        'soundArticles' => boolval($setup['soundArticles'] ?? null),
        'plural' => boolval($setup['plural'] ?? null),
        'soundPlural' => boolval($setup['soundPlural'] ?? null),
        'verbs' => boolval($setup['verbs'] ?? null),
        'strongVerbs' => boolval($setup['strongVerbs'] ?? null),
        'soundStrongVerbs' => boolval($setup['soundStrongVerbs'] ?? null),
        'irregularVerbs' => boolval($setup['irregularVerbs'] ?? null),
        'soundIrregularVerbs' => boolval($setup['soundIrregularVerbs'] ?? null),
        'others' => boolval($setup['others'] ?? null),
        'soundOther' => boolval($setup['soundOther'] ?? null),
      ];

      (new \api\Data())->updateSetup($model);
      $response->data($model);
      echo $response->getResult();
    }
  }
