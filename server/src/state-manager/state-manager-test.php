<?php

namespace src;

use PHPUnit\Framework\TestCase;

final class StateManagerTest extends TestCase {
  /** @var StateManager */
  protected $instance;

  protected function setUp(): void {
    $this->instance = new StateManager();
  }

  protected function tearDown(): void {
    $this->instance->clear();
  }

  public function testUpdateState(): void {
    $this->assertCount(0, $this->instance->getState());
    $this->instance->updateState('firstLevel', []);
    $this->assertArrayHasKey('firstLevel', $this->instance->getState());
    $this->instance->updateState('anotherFirstLevel.withSubLevel', [ 'subLevel' => 14 ]);
    $this->assertArrayHasKey('anotherFirstLevel', $this->instance->getState());
    $this->assertEquals(14, $this->instance->getState('anotherFirstLevel.withSubLevel.subLevel'));
  }

  public function testRemoveKey(): void {
    $this->instance->updateState('firstLevel', []);
    $this->instance->updateState('anotherFirstLevel.withSubLevel', [ 'subLevel' => 14 ]);
    $this->instance->removeKey('anotherFirstLevel.withSubLevel');
    $this->assertArrayHasKey('anotherFirstLevel', $this->instance->getState());
    $this->assertArrayHasKey('firstLevel', $this->instance->getState());
    self::assertNull($this->instance->getState('anotherFirstLevel.withSubLevel'));
  }
}

