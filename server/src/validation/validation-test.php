<?php

namespace src;

use PHPUnit\Framework\TestCase;

final class ValidationTest extends TestCase {
  /** @var Validation */
  protected $instance;

  public function testValidateField(): void {
    $this->assertTrue(!(new Validation('login', 'l'))->isValid());
    $this->assertTrue((new Validation('login', 'll'))->isValid());
    $this->assertTrue(!(new Validation('type', 'l'))->isValid());
    $this->assertTrue((new Validation('type', 'noun'))->isValid());
    $this->assertTrue((new Validation('article', null))->isValid());
  }

  public function testValidateData(): void {
    $data = [ 'login' => 'l', 'type' => 'noun', 'password' => null ];
    $this->assertContains('login', Validation::validateData($data, ['login', 'type']));
    $this->assertCount(1, Validation::validateData($data, ['login', 'type']));
  }
}

