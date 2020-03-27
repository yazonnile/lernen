<?php

namespace src;

use PHPUnit\Framework\TestCase;

final class SyncManagerTest extends TestCase {
  protected $queryMock;
  protected $query;

  private function getWordByPart($word) {
    return array_merge([
      'translation' => null,
      'article' => null,
      'plural' => null,
      'strong1' => null,
      'strong2' => null,
      'strong3' => null,
      'strong4' => null,
      'strong5' => null,
      'strong6' => null,
      'irregular1' => null,
      'irregular2' => null,
      'type' => 'verb',
      'active' => 1
    ], $word);
  }

  protected function setUp(): void {
    $this->queryMock = $this->getMockBuilder(Query::class)
      ->disableOriginalConstructor()
      ->onlyMethods([
        'deleteCategories',
        'deleteWords',
        'update',
        'getCategoriesByNames',
        'deleteWordToCategoriesByWordName',
        'getWordsByNames',
        'categoriesExistByIds',
      ])->getMock();
  }

  public function testUpdateCategories(): void {
    $this->queryMock->expects($this->once())->method('update')->with(
      'categories', [
        ['categoryId' => 6,    'categoryName' => 'originalCategory', 'userId' => 1],
        ['categoryId' => null, 'categoryName' => 'firstCategory',    'userId' => 1],
        ['categoryId' => null, 'categoryName' => 'secondCategory',   'userId' => 1]
      ]
    );

    $this->queryMock->expects($this->once())->method('getCategoriesByNames')->with(
      ['originalCategory', 'firstCategory', 'secondCategory'], 1
    )->willReturn([
      [ 'categoryId' => 6, 'categoryName' => 'originalCategory' ],
      [ 'categoryId' => 7, 'categoryName' => 'firstCategory' ],
      [ 'categoryId' => 8, 'categoryName'  => 'secondCategory' ],
    ]);

    $instance = new SyncManager([
      'data' => [
        'categories' => [
          6 =>   [ 'categoryId' => 6,   'categoryName' => 'originalCategory' ],
          123 => [ 'categoryId' => 123, 'categoryName' => 'firstCategory' ],
          124 => [ 'categoryId' => 124, 'categoryName' => 'secondCategory' ]
        ],
      ],
      'categories' => [
        'toCreate' => [123,124],
        'toUpdate' => [6]
      ]
    ], $this->queryMock, 1);
    $instance->syncCategories();

    $categoriesMap = $instance->getState('categoriesMap');
    $this->assertEqualsCanonicalizing([ 6, 123, 124 ], array_keys($categoriesMap));
    $this->assertEqualsCanonicalizing([ 6, 7, 8 ], array_values($categoriesMap));
  }

  public function testDeleteCategories(): void {
    $this->queryMock->expects($this->once())->method('deleteCategories')->with([1,2,3]);
    $instance = new SyncManager([
      'categories' => [
        'toDelete' => [1,2,3]
      ]
    ], $this->queryMock, 1);
    $instance->syncCategories();

    $this->assertCount(0, $instance->getState('categoriesMap'));
  }

  public function testUpdateWords(): void {
    $this->queryMock->expects($this->once())->method('deleteWordToCategoriesByWordName')->with(
      [ 'qwe', 'rty', 'uio' ], 1
    );

    $this->queryMock->expects($this->exactly(2))->method('update')->withConsecutive(
      ['words', [
        $this->getWordByPart(['wordId' => 6,    'type' => 'verb', 'original' => 'qwe', 'userId' => 1]),
        $this->getWordByPart(['wordId' => null, 'type' => 'verb', 'original' => 'rty', 'userId' => 1]),
        $this->getWordByPart(['wordId' => null, 'type' => 'verb', 'original' => 'uio', 'userId' => 1]),
      ]],
      ['words_to_categories', [
        ['wordId' => 7, 'categoryId' => 1],
        ['wordId' => 7, 'categoryId' => 2],
      ]]
    );

    $this->queryMock->expects($this->once())->method('getWordsByNames')->with(
      [ 'qwe', 'rty', 'uio' ], 1
    )->willReturn([
      [ 'wordId' => 7, 'original' => 'qwe' ],
      [ 'wordId' => 8, 'original' => 'rty' ],
      [ 'wordId' => 9, 'original'  => 'uio' ],
    ]);

    $this->queryMock->expects($this->once())->method('categoriesExistByIds')->with(
      [ 1, 2 ], 1
    )->willReturn([
      [ 'categoryId' => 1 ],
      [ 'categoryId' => 2 ],
    ]);

    $instance = new SyncManager([
      'data' => [
        'words' => [
          6 =>   $this->getWordByPart([ 'wordId' => 6,   'original' => 'qwe', 'categories' => [1,2]]),
          123 => $this->getWordByPart([ 'wordId' => 123, 'original' => 'rty' ]),
          124 => $this->getWordByPart([ 'wordId' => 124, 'original' => 'uio' ]),
        ],
      ],
      'words' => [
        'toCreate' => [123,124],
        'toUpdate' => [6]
      ]
    ], $this->queryMock, 1);
    $instance->syncWords();

    $wordsMap = $instance->getState('wordsMap');
    $this->assertEqualsCanonicalizing([ 6, 123, 124 ], array_keys($wordsMap));
    $this->assertEqualsCanonicalizing([ 7, 8, 9 ], array_values($wordsMap));
  }

  public function testDeleteWords(): void {
    $this->queryMock->expects($this->once())->method('deleteWords')->with([1,2,3]);
    $instance = new SyncManager([
      'words' => [
        'toDelete' => [1,2,3]
      ]
    ], $this->queryMock, 1);
    $instance->syncWords();

    $this->assertCount(0, $instance->getState('wordsMap'));
  }

  public function testDeleteCategoryAndEditWords(): void {
    $this->queryMock->expects($this->once())->method('deleteCategories')->with([1,2,3]);

    $this->queryMock->expects($this->once())->method('deleteWordToCategoriesByWordName')->with(
      [ 'qwe', 'rty', 'uio' ], 1
    );

    $this->queryMock->expects($this->exactly(2))->method('update')->withConsecutive(
      ['words', [
        $this->getWordByPart(['wordId' => 6,    'type' => 'verb', 'original' => 'qwe', 'userId' => 1]),
        $this->getWordByPart(['wordId' => null, 'type' => 'verb', 'original' => 'rty', 'userId' => 1]),
        $this->getWordByPart(['wordId' => null, 'type' => 'verb', 'original' => 'uio', 'userId' => 1]),
      ]],
      ['words_to_categories', [
        ['wordId' => 7, 'categoryId' => 4],
        ['wordId' => 7, 'categoryId' => 5],
      ]]
    );

    $this->queryMock->expects($this->once())->method('getWordsByNames')->with(
      [ 'qwe', 'rty', 'uio' ], 1
    )->willReturn([
      [ 'wordId' => 7, 'original' => 'qwe' ],
      [ 'wordId' => 8, 'original' => 'rty' ],
      [ 'wordId' => 9, 'original'  => 'uio' ],
    ]);

    $this->queryMock->expects($this->once())->method('categoriesExistByIds')->with(
      [ 4, 5 ], 1
    )->willReturn([
      [ 'categoryId' => 4 ],
      [ 'categoryId' => 5 ],
    ]);

    $instance = new SyncManager([
      'data' => [
        'words' => [
          6 =>   $this->getWordByPart([ 'wordId' => 6,   'original' => 'qwe', 'categories' => [4,5]]),
          123 => $this->getWordByPart([ 'wordId' => 123, 'original' => 'rty' ]),
          124 => $this->getWordByPart([ 'wordId' => 124, 'original' => 'uio' ]),
        ],
      ],
      'words' => [
        'toCreate' => [123,124],
        'toUpdate' => [6]
      ],
      'categories' => [
        'toDelete' => [1,2,3]
      ]
    ], $this->queryMock, 1);
    $instance->syncWords();
    $instance->syncCategories();

    $wordsMap = $instance->getState('wordsMap');
    $this->assertEqualsCanonicalizing([ 6, 123, 124 ], array_keys($wordsMap));
    $this->assertEqualsCanonicalizing([ 7, 8, 9 ], array_values($wordsMap));
    $this->assertCount(0, $instance->getState('categoriesMap'));
  }

  public function testSyncAll(): void {
    $this->queryMock->expects($this->once())->method('getCategoriesByNames')->with(
      ['originalCategory', 'firstCategory', 'secondCategory'], 1
    )->willReturn([
      [ 'categoryId' => 1, 'categoryName' => 'originalCategory' ],
      [ 'categoryId' => 4, 'categoryName' => 'firstCategory' ],
      [ 'categoryId' => 5, 'categoryName'  => 'secondCategory' ],
    ]);

    $this->queryMock->expects($this->once())->method('deleteCategories')->with([2,3]);

    $this->queryMock->expects($this->once())->method('deleteWordToCategoriesByWordName')->with(
      [ 'qwe', 'rty', 'uio' ], 1
    );

    $this->queryMock->expects($this->exactly(3))->method('update')->withConsecutive(
      ['categories', [
        ['categoryId' => 1,    'categoryName' => 'originalCategory', 'userId' => 1],
        ['categoryId' => null, 'categoryName' => 'firstCategory',    'userId' => 1],
        ['categoryId' => null, 'categoryName' => 'secondCategory',   'userId' => 1]
      ]],
      ['words', [
        $this->getWordByPart(['wordId' => 6,    'type' => 'verb', 'original' => 'qwe', 'userId' => 1]),
        $this->getWordByPart(['wordId' => null, 'type' => 'verb', 'original' => 'rty', 'userId' => 1]),
        $this->getWordByPart(['wordId' => null, 'type' => 'verb', 'original' => 'uio', 'userId' => 1]),
      ]],
      ['words_to_categories', [
        ['wordId' => 7, 'categoryId' => 4],
        ['wordId' => 7, 'categoryId' => 5],
        ['wordId' => 8, 'categoryId' => 1],
        ['wordId' => 8, 'categoryId' => 5],
      ]],
    );

    $this->queryMock->expects($this->once())->method('getWordsByNames')->with(
      [ 'qwe', 'rty', 'uio' ], 1
    )->willReturn([
      [ 'wordId' => 7, 'original' => 'qwe' ],
      [ 'wordId' => 8, 'original' => 'rty' ],
      [ 'wordId' => 9, 'original'  => 'uio' ],
    ]);

    $this->queryMock->expects($this->once())->method('categoriesExistByIds')->with(
      [ 4, 5, 1 ], 1
    )->willReturn([
      [ 'categoryId' => 1 ],
      [ 'categoryId' => 4 ],
      [ 'categoryId' => 5 ],
    ]);

    $instance = new SyncManager([
      'data' => [
        'categories' => [
          1 =>   [ 'categoryId' => 1,   'categoryName' => 'originalCategory' ],
          101 => [ 'categoryId' => 101, 'categoryName' => 'firstCategory' ],
          102 => [ 'categoryId' => 102, 'categoryName' => 'secondCategory' ]
        ],
        'words' => [
          6 =>   $this->getWordByPart([ 'wordId' => 6,   'original' => 'qwe', 'categories' => [101,102]]),
          123 => $this->getWordByPart([ 'wordId' => 123, 'original' => 'rty', 'categories' => [1,102] ]),
          124 => $this->getWordByPart([ 'wordId' => 124, 'original' => 'uio' ]),
        ],
      ],
      'categories' => [
        'toCreate' => [101,102],
        'toUpdate' => [1],
        'toDelete' => [2,3]
      ],
      'words' => [
        'toCreate' => [123,124],
        'toUpdate' => [6],
        'toDelete' => [1,2,3]
      ]
    ], $this->queryMock, 1);
    $instance->syncCategories();
    $instance->syncWords();

    $categoriesMap = $instance->getState('categoriesMap');
    $this->assertEqualsCanonicalizing([ 1, 101, 102 ], array_keys($categoriesMap));
    $this->assertEqualsCanonicalizing([ 1, 4, 5 ], array_values($categoriesMap));

    $wordsMap = $instance->getState('wordsMap');
    $this->assertEqualsCanonicalizing([ 6, 123, 124 ], array_keys($wordsMap));
    $this->assertEqualsCanonicalizing([ 7, 8, 9 ], array_values($wordsMap));
  }
}

