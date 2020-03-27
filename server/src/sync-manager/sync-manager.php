<?php

namespace src;

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
  }

  private function getPayloadValue($key) {
    return $this->payload['data']['setup'][$key] ?? null;
  }

  private function getSetupPayloadValue($key) {
    return intval(boolval($this->getPayloadValue($key)));
  }

  public function syncSetup() {
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

  public function syncCategories() {
    $categoriesIds = $this->payload['categories'] ?? [];
    $categoriesToDelete = $categoriesIds['toDelete'] ?? [];
    $categoriesToUpdate = $categoriesIds['toUpdate'] ?? [];
    $categoriesToCreate = $categoriesIds['toCreate'] ?? [];
    $categoriesData = $this->payload['data']['categories'] ?? [];

    if (count($categoriesToDelete)) {
      $this->query->deleteCategories($categoriesToDelete, $this->userId);
    }

    foreach ($categoriesToCreate as $newCategoryId) {
      $categoriesData[$newCategoryId]['new'] = true;
    }

    $categoriesToUpdate = array_unique(array_merge($categoriesToUpdate, $categoriesToCreate));

    if (!count($categoriesToUpdate)) {
      return;
    }

    // validate category names
    $validCategoriesIds = array_filter($categoriesToUpdate, function($categoryId) use($categoriesData) {
      $name = $categoriesData[$categoryId]['categoryName'] ?? null;
      return is_string($name) && mb_strlen($name) > 0 && mb_strlen($name) <= 100;
    });

    $this->updateState('notValidCategories', array_diff($categoriesToUpdate, $validCategoriesIds));

    if (!count($categoriesToUpdate)) {
      return;
    }

    $this->query->update('categories', array_map(function($categoryId) use($categoriesData) {
      $category = $categoriesData[$categoryId];
      return [
        'categoryId' => isset($category['new']) ? null : $categoryId,
        'categoryName' => $category['categoryName'],
        'userId' => $this->userId,
      ];
    }, $validCategoriesIds));

    // create map
    $categoryNames = array_map(function($categoryId) use($categoriesData) {
      return $categoriesData[$categoryId]['categoryName'];
    }, $validCategoriesIds);

    $updatedCategories = $this->query->getCategoriesByNames($categoryNames, $this->userId);
    $categoriesMap = [];
    foreach ($updatedCategories as $updatedCategory) {
      foreach ($categoriesData as $oldCategoryId => $oldCategory) {
        if ($updatedCategory['categoryName'] === $oldCategory['categoryName']) {
          $categoriesMap[$oldCategoryId] = $updatedCategory['categoryId'];
        }
      }
    }

    $this->updateState('categoriesMap', $categoriesMap);
  }

  public function syncWords() {
    $wordsIds = $this->payload['words'] ?? [];
    $wordsToDelete = $wordsIds['toDelete'] ?? [];
    $wordsToUpdate = $wordsIds['toUpdate'] ?? [];
    $wordsToCreate = $wordsIds['toCreate'] ?? [];
    $wordsData = $this->payload['data']['words'] ?? [];

    if (count($wordsToDelete)) {
      $this->query->deleteWords($wordsToDelete, $this->userId);
    }

    foreach ($wordsToCreate as $newWordId) {
      $wordsData[$newWordId]['new'] = true;
    }

    $wordsToUpdate = array_unique(array_merge($wordsToUpdate, $wordsToCreate));
    $validWordsIds = array_filter($wordsToUpdate, function($wordId) use($wordsData) {
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

    $this->updateState('notValidWords', array_diff($validWordsIds, $validWordsIds));

    if (!count($validWordsIds)) {
      return;
    }

    // create words map
    $wordsNames = array_map(function($wordId) use($wordsData) {
      return $wordsData[$wordId]['original'];
    }, $validWordsIds);

    // delete joins for OLD wordsIds
    $this->query->deleteWordToCategoriesByWordName($wordsNames, $this->userId);

    // update words
    $this->query->update('words', array_map(function($wordId) use($wordsData) {
      $word = $wordsData[$wordId];
      return [
        'userId' => $this->userId,
        'wordId' => isset($word['new']) ? null : $wordId,
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

    // create words map
    $updatedWords = $this->query->getWordsByNames($wordsNames, $this->userId);
    $wordsMap = [];
    foreach ($updatedWords as $updatedWord) {
      foreach ($wordsData as $oldWordId => $oldWord) {
        if ($updatedWord['original'] === $oldWord['original']) {
          $wordsMap[$oldWordId] = $updatedWord['wordId'];
        }
      }
    }

    $oldWordsIds = array_keys($wordsMap);
    $this->updateState('wordsMap', $wordsMap);

    // update categories assign
    $categoriesToAssign = [];
    $categoriesMap = $this->getState('categoriesMap');
    foreach ($oldWordsIds as $i => $oldWordId) {
      $categoriesToAssign = array_merge(
        $categoriesToAssign,
        array_map(function($categoryId) use($categoriesMap) {
          return $categoriesMap[$categoryId] ?? $categoryId;
        }, $wordsData[$oldWordId]['categories'] ?? [])
      );
    }

    $categoriesToAssign = array_unique($categoriesToAssign);

    if (!count($categoriesToAssign)) {
      return;
    }

    $existingCategoriesToAssign = array_map(function($category) {
      return $category['categoryId'];
    }, $this->query->categoriesExistByIds($categoriesToAssign, $this->userId));

    if (!count($categoriesToAssign)) {
      return;
    }

    $this->query->update(
      'words_to_categories',
      array_reduce($oldWordsIds, function($carry, $oldWordId) use($wordsMap, $wordsData, $existingCategoriesToAssign, $categoriesMap) {
        $oldCategoryIds = $wordsData[$oldWordId]['categories'] ?? [];
        foreach ($oldCategoryIds as $oldCategoryId) {
          $updatedCategoryId = $categoriesMap[$oldCategoryId] ?? $oldCategoryId;
          if (in_array($updatedCategoryId, $existingCategoriesToAssign)) {
            $carry[] = [
              'wordId' => $wordsMap[$oldWordId],
              'categoryId' => $updatedCategoryId
            ];
          }
        }

        return $carry;
      }, [])
    );
  }
}
