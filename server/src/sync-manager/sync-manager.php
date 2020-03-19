<?php

  class SyncManager extends StateManager {
    private $payload;
    private $userId;

    /** @var Query */
    private $query;

    public function __construct($payload, $query, $userId) {
      $this->payload = $payload;
      $this->userId = $userId;
      $this->query = $query;

      $this->updateState(null, [
        'categoriesMap' => [],
        'wordsMap' => [],
      ]);

      $this->syncSetup();
      $this->syncCategories();
      $this->syncWords();
    }

    private function getPayloadValue($key) {
      return $this->payload['data']['setup'][$key] ?? null;
    }

    private function getSetupPayloadValue($key) {
      return intval(boolval($this->getPayloadValue($key)));
    }

    private function syncSetup() {
      if ($this->payload['setup'] ?? null) {
        $this->query->update('users', [
          'userId' => $this->userId,
          'voice' => $this->getSetupPayloadValue('voice'),
          'voiceSpeed' => min(15, max(5, intval($this->getPayloadValue('voiceSpeed')))),
          'phrases' => $this->getSetupPayloadValue('phrases'),
          'soundPhrases' => $this->getSetupPayloadValue('soundPhrases'),
          'other' => $this->getSetupPayloadValue('other'),
          'nouns' => $this->getSetupPayloadValue('nouns'),
          'soundNouns' => $this->getSetupPayloadValue('soundNouns'),
          'articles' => $this->getSetupPayloadValue('articles'),
          'soundArticles' => $this->getSetupPayloadValue('soundArticles'),
          'plural' => $this->getSetupPayloadValue('plural'),
          'soundPlural' => $this->getSetupPayloadValue('soundPlural'),
          'verbs' => $this->getSetupPayloadValue('verbs'),
          'soundVerbs' => $this->getSetupPayloadValue('soundVerbs'),
          'strongVerbs' => $this->getSetupPayloadValue('strongVerbs'),
          'soundStrongVerbs' => $this->getSetupPayloadValue('soundStrongVerbs'),
          'irregularVerbs' => $this->getSetupPayloadValue('irregularVerbs'),
          'soundIrregularVerbs' => $this->getSetupPayloadValue('soundIrregularVerbs'),
        ]);
      }
    }

    private function syncCategories() {
      $categoriesIds = $this->payload['categories'] ?? [];
      $categoriesToDelete = $categoriesIds['toDelete'] ?? [];
      $categoriesToUpdate = $categoriesIds['toUpdate'] ?? [];
      $categoriesToCreate = $categoriesIds['toCreate'] ?? [];
      $categoriesData = $this->payload['data']['categories'] ?? [];

      if (count($categoriesToDelete)) {
        $this->query->deleteWords($categoriesToDelete, $this->userId);
      }

      if (count($categoriesToUpdate)) {
        $this->saveCategories(array_map(function($category) {
          return $category['categoryId'];
        }, $this->query->categoriesExistByIds($categoriesToUpdate, $this->userId)), $categoriesData);
      }

      // create categories
      if (count($categoriesToCreate)) {
        $this->updateState(
          'categoriesMap',
          $this->saveCategories($categoriesToCreate, $categoriesData, true)
        );
      }
    }

    private function saveCategories($categoriesIds, $categoriesData, $returnMap = false) {
      // validate category names
      $validCategoriesIds = array_filter($categoriesIds, function($categoryId) use($categoriesData) {
        $name = $categoriesData[$categoryId]['categoryName'] ?? null;
        return is_string($name) && mb_strlen($name) > 0 && mb_strlen($name) <= 100;
      });

      $this->updateState($returnMap ? 'notValidNewCategories' : 'notValidUpdatedCategories', array_diff($categoriesIds, $validCategoriesIds));

      if (count($validCategoriesIds)) {
        $this->query->update('categories', array_map(function($categoryId) use($returnMap, $categoriesData) {
          return [
            'categoryId' => $returnMap ? null : $categoryId,
            'categoryName' => $categoriesData[$categoryId]['categoryName'],
            'userId' => $this->userId,
          ];
        }, $validCategoriesIds));

        if ($returnMap) {
          $lastCategoryId = $this->query->getLastInsertId();
          $categoriesMap = [];

          // get new assigned categories ids
          foreach ($validCategoriesIds as $i => $oldCategoryId) {
            $categoriesMap[$oldCategoryId] = $lastCategoryId + $i;
          }

          return $categoriesMap;
        }
      }
    }

    private function syncWords() {
      $wordsIds = $this->payload['words'] ?? [];
      $wordsToDelete = $wordsIds['toDelete'] ?? [];
      $wordsToUpdate = $wordsIds['toUpdate'] ?? [];
      $wordsToCreate = $wordsIds['toCreate'] ?? [];
      $wordsData = $this->payload['data']['words'] ?? [];

      if (count($wordsToDelete)) {
        $this->query->deleteWords($wordsToDelete, $this->userId);
      }

      if (count($wordsToUpdate)) {
        $this->saveWords(array_map(function($word) {
          return $word['wordId'];
        }, $this->query->wordsExistByIds($wordsToUpdate, $this->userId)), $wordsData);
      }

      if (count($wordsToCreate)) {
        $this->updateState(
          'wordsMap',
          $this->saveWords($wordsToCreate, $wordsData, true)
        );
      }
    }

    private function saveWords($wordsIds, $wordsData, $returnMap = false) {
      $validWordsIds = array_filter($wordsIds, function($wordId) use($wordsData) {
        $errors = Validation::validateData($wordsData[$wordId], [
          'original',
          'translation',
          'article',
          'plural',
          'strong1',
          'strong2',
          'strong3',
          'strong4',
          'strong5',
          'strong6',
          'irregular1',
          'irregular2',
          'type'
        ]);
        return !count($errors);
      });

      $this->updateState($returnMap ? 'notValidNewWords' : 'notValidUpdatedWords', array_diff($wordsIds, $validWordsIds));

      if (count($validWordsIds)) {
        $this->query->update('words', array_map(function($wordId) use($wordsData, $returnMap) {
          return [
            'userId' => $this->userId,
            'wordId' => $returnMap ? null : $wordId,
            'original' => $wordsData[$wordId]['original'],
            'translation' => $wordsData[$wordId]['translation'],
            'article' => $wordsData[$wordId]['article'],
            'plural' => $wordsData[$wordId]['plural'],
            'strong1' => $wordsData[$wordId]['strong1'],
            'strong2' => $wordsData[$wordId]['strong2'],
            'strong3' => $wordsData[$wordId]['strong3'],
            'strong4' => $wordsData[$wordId]['strong4'],
            'strong5' => $wordsData[$wordId]['strong5'],
            'strong6' => $wordsData[$wordId]['strong6'],
            'irregular1' => $wordsData[$wordId]['irregular1'],
            'irregular2' => $wordsData[$wordId]['irregular2'],
            'active' => intval(boolval($wordsData[$wordId]['active'])),
            'type' => $wordsData[$wordId]['type'],
          ];
        }, $validWordsIds));

        // create words map and categories array
        $wordsMap = [];
        $categoriesToAssign = [];
        $lastWordId = $this->query->getLastInsertId();
        $categoriesMap = $this->getState('categoriesMap');

        foreach ($validWordsIds as $i => $oldWordId) {
          $wordsMap[$oldWordId] = $returnMap ? $lastWordId + $i : $oldWordId;
          $categoriesToAssign = array_merge($categoriesToAssign, array_map(function($categoryId) use($categoriesMap) {
            return $categoriesMap[$categoryId] ?? $categoryId;
          }, $wordsData[$oldWordId]['categories'] ?? []));
        }

        $this->query->deleteWordToCategories($validWordsIds, $this->userId);

        if (count($categoriesToAssign)) {
          $categoriesToAssign = array_map(function($category) {
            return $category['categoryId'];
          }, $this->query->categoriesExistByIds($categoriesToAssign, $this->userId));

          $this->query->update(
            'words_to_categories',
            array_reduce($validWordsIds, function($carry, $oldWordId) use($wordsMap, $wordsData, $categoriesToAssign, $categoriesMap) {
              $categories = $wordsData[$oldWordId]['categories'] ?? [];
              foreach ($categories as $categoryId) {
                $categoryId = $categoriesMap[$categoryId] ?? $categoryId;
                if (in_array($categoryId, $categoriesToAssign)) {
                  $carry[] = [
                    'wordId' => $wordsMap[$oldWordId],
                    'categoryId' => $categoryId
                  ];
                }
              }

              return $carry;
            }, [])
          );
        }

        if ($returnMap) {
          return $wordsMap;
        }
      }
    }
  }
